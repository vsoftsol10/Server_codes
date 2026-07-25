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

export const BudgetCalculationService = {
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
