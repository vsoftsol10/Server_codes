import { prisma } from '../config/database.js';

const normalizeAmount = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const buildProjectWhere = (projectId, companyId) => ({
  id: Number(projectId),
  ...(companyId ? { companyId } : {}),
});

const buildProjectScopedWhere = (projectId, companyId) => ({
  projectId: Number(projectId),
  ...(companyId ? { project: { companyId } } : {}),
});

const sumMaterialUsages = (materialUsages = []) => normalizeAmount(
  materialUsages.reduce((sum, usage) => {
    const quantity = Number(usage.quantity || 0);
    const rate = Number(usage.material?.defaultRate || 0);
    return sum + (quantity * rate);
  }, 0)
);

const sumLabourPayments = (labours = []) => normalizeAmount(
  labours.reduce((sum, labour) => (
    sum + (labour.payments || []).reduce((paymentSum, payment) => (
      paymentSum + Number(payment.amount || 0)
    ), 0)
  ), 0)
);

const toBudgetSummary = ({
  totalBudget,
  materialCost,
  labourCost,
  contractCost,
  expenseCost,
}) => {
  const totalSpent = normalizeAmount(materialCost + labourCost + contractCost + expenseCost);
  const remainingBudget = normalizeAmount(totalBudget - totalSpent);

  return {
    totalBudget: normalizeAmount(totalBudget),
    materialCost: normalizeAmount(materialCost),
    labourCost: normalizeAmount(labourCost),
    contractCost: normalizeAmount(contractCost),
    expenseCost: normalizeAmount(expenseCost),
    totalSpent,
    remainingBudget,
    breakdown: {
      materialCost: normalizeAmount(materialCost),
      labourCost: normalizeAmount(labourCost),
      contractorPayments: normalizeAmount(contractCost),
      contractAmount: normalizeAmount(contractCost),
      financialExpenses: normalizeAmount(expenseCost),
      expenseCost: normalizeAmount(expenseCost),
    },
  };
};

const createEmptyTotals = () => ({
  materialCost: 0,
  labourCost: 0,
  contractCost: 0,
  expenseCost: 0,
});

const addToProjectTotal = (totalsByProjectId, projectId, key, amount) => {
  const numericProjectId = Number(projectId);
  if (!totalsByProjectId.has(numericProjectId)) {
    totalsByProjectId.set(numericProjectId, createEmptyTotals());
  }

  const totals = totalsByProjectId.get(numericProjectId);
  totals[key] = normalizeAmount(totals[key] + Number(amount || 0));
};

const normalizeProjectInputs = (projectsOrIds = []) => (
  projectsOrIds
    .map((projectOrId) => (
      typeof projectOrId === 'object' && projectOrId !== null
        ? projectOrId
        : { id: Number(projectOrId) }
    ))
    .filter((project) => Number.isInteger(Number(project.id)))
);

export const BudgetCalculationService = {
  calculateProjectsFinancials: async (projectsOrIds = [], options = {}) => {
    const inputProjects = normalizeProjectInputs(projectsOrIds);
    if (inputProjects.length === 0) {
      return new Map();
    }

    const projectIds = [...new Set(inputProjects.map((project) => Number(project.id)))];
    const projectsMissingBudget = inputProjects.some(
      (project) => project.budget === undefined && project.quotationAmount === undefined
    );

    const projects = projectsMissingBudget
      ? await prisma.project.findMany({
          where: {
            id: { in: projectIds },
            ...(options.companyId ? { companyId: options.companyId } : {}),
          },
          select: {
            id: true,
            budget: true,
            quotationAmount: true,
          },
        })
      : inputProjects;

    const scopedProjectIds = projects.map((project) => Number(project.id));
    if (scopedProjectIds.length === 0) {
      return new Map();
    }

    const totalsByProjectId = new Map(
      scopedProjectIds.map((projectId) => [projectId, createEmptyTotals()])
    );

    const [
      materialUsages,
      labours,
      contractAggregates,
      expenseAggregates,
    ] = await Promise.all([
      prisma.materialUsage.findMany({
        where: {
          projectId: { in: scopedProjectIds },
          ...(options.companyId ? { project: { companyId: options.companyId } } : {}),
        },
        select: {
          projectId: true,
          quantity: true,
          material: {
            select: {
              defaultRate: true,
            },
          },
        },
      }),
      prisma.labour.findMany({
        where: {
          projectId: { in: scopedProjectIds },
          ...(options.companyId ? { companyId: options.companyId } : {}),
        },
        select: {
          projectId: true,
          payments: {
            select: {
              amount: true,
            },
          },
        },
      }),
      prisma.contract.groupBy({
        by: ['projectId'],
        where: {
          projectId: { in: scopedProjectIds },
          ...(options.companyId ? { project: { companyId: options.companyId } } : {}),
        },
        _sum: {
          contractAmount: true,
        },
      }),
      prisma.projectExpense.groupBy({
        by: ['projectId'],
        where: {
          projectId: { in: scopedProjectIds },
          ...(options.companyId ? { project: { companyId: options.companyId } } : {}),
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    materialUsages.forEach((usage) => {
      const quantity = Number(usage.quantity || 0);
      const rate = Number(usage.material?.defaultRate || 0);
      addToProjectTotal(totalsByProjectId, usage.projectId, 'materialCost', quantity * rate);
    });

    labours.forEach((labour) => {
      const labourPaymentTotal = (labour.payments || []).reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );
      addToProjectTotal(totalsByProjectId, labour.projectId, 'labourCost', labourPaymentTotal);
    });

    contractAggregates.forEach((aggregate) => {
      addToProjectTotal(
        totalsByProjectId,
        aggregate.projectId,
        'contractCost',
        aggregate._sum.contractAmount
      );
    });

    expenseAggregates.forEach((aggregate) => {
      addToProjectTotal(
        totalsByProjectId,
        aggregate.projectId,
        'expenseCost',
        aggregate._sum.amount
      );
    });

    return new Map(projects.map((project) => {
      const totals = totalsByProjectId.get(Number(project.id)) || createEmptyTotals();
      return [
        Number(project.id),
        toBudgetSummary({
          totalBudget: project.budget ?? project.quotationAmount ?? 0,
          materialCost: totals.materialCost,
          labourCost: totals.labourCost,
          contractCost: totals.contractCost,
          expenseCost: totals.expenseCost,
        }),
      ];
    }));
  },

  calculateProjectFinancials: async (projectId, options = {}) => {
    const numericProjectId = Number(projectId);
    if (!Number.isInteger(numericProjectId)) {
      throw new Error('Invalid project ID');
    }

    const project = await prisma.project.findFirst({
      where: buildProjectWhere(numericProjectId, options.companyId),
      select: {
        id: true,
        budget: true,
        quotationAmount: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const [
      materialUsages,
      labours,
      contractAggregate,
      expenseAggregate,
    ] = await Promise.all([
      prisma.materialUsage.findMany({
        where: buildProjectScopedWhere(numericProjectId, options.companyId),
        select: {
          quantity: true,
          material: {
            select: {
              defaultRate: true,
            },
          },
        },
      }),
      prisma.labour.findMany({
        where: {
          projectId: numericProjectId,
          ...(options.companyId ? { companyId: options.companyId } : {}),
        },
        select: {
          payments: {
            select: {
              amount: true,
            },
          },
        },
      }),
      prisma.contract.aggregate({
        where: buildProjectScopedWhere(numericProjectId, options.companyId),
        _sum: {
          contractAmount: true,
        },
      }),
      prisma.projectExpense.aggregate({
        where: buildProjectScopedWhere(numericProjectId, options.companyId),
        _sum: {
          amount: true,
        },
      }),
    ]);

    return toBudgetSummary({
      totalBudget: project.budget ?? project.quotationAmount ?? 0,
      materialCost: sumMaterialUsages(materialUsages),
      labourCost: sumLabourPayments(labours),
      contractCost: contractAggregate._sum.contractAmount || 0,
      expenseCost: expenseAggregate._sum.amount || 0,
    });
  },

  calculateProjectBudget: async (projectId, options = {}) => (
    BudgetCalculationService.calculateProjectFinancials(projectId, options)
  ),
};

export default BudgetCalculationService;
