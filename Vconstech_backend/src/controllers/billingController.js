import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========== CREATE BILL ==========
export const createBill = async (req, res) => {
  try {
    const {
      billNumber,
      billDate,
      dueDate,
      companyName,
      companyAddress,
      companyGST,
      companyPhone,
      companyEmail,
      clientName,
      clientAddress,
      clientGST,
      clientPhone,
      clientEmail,
      projectName,
      projectLocation,
      workOrderNo,
      projectId,
      items,
      labourCharges,
      transportCharges,
      otherCharges,
      otherChargesDescription,
      cgst,
      sgst,
      igst,
      tds,
      retention,
      advancePaid,
      previousBills,
      remarks,
      termsAndConditions,
    } = req.body;

    const companyId = req.user.companyId;
    const createdBy = req.user.userId;

    console.log('User object:', req.user);
    console.log('Created by:', createdBy);

    // Validate required fields
    if (!billNumber || !billDate || !clientName || !projectName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: billNumber, billDate, clientName, projectName'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one bill item is required'
      });
    }

    // Check if bill number already exists
    const existingBill = await prisma.bill.findUnique({
      where: { billId: billNumber }
    });

    if (existingBill) {
      return res.status(400).json({
        success: false,
        error: `Bill number ${billNumber} already exists`
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    
    const grossAmount = subtotal + 
      parseFloat(labourCharges || 0) + 
      parseFloat(transportCharges || 0) + 
      parseFloat(otherCharges || 0);
    
    const cgstAmount = (grossAmount * parseFloat(cgst || 0)) / 100;
    const sgstAmount = (grossAmount * parseFloat(sgst || 0)) / 100;
    const igstAmount = (grossAmount * parseFloat(igst || 0)) / 100;
    
    const totalWithTax = grossAmount + cgstAmount + sgstAmount + igstAmount;
    
    const tdsAmount = (totalWithTax * parseFloat(tds || 0)) / 100;
    const retentionAmount = (totalWithTax * parseFloat(retention || 0)) / 100;
    
    const netPayable = totalWithTax - tdsAmount - retentionAmount - 
      parseFloat(advancePaid || 0) - parseFloat(previousBills || 0);

    const billData = {
      billId: billNumber,
      billDate: new Date(billDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      
      // Company info
      companyName,
      companyAddress,
      companyGST,
      companyPhone,
      companyEmail,
      
      // Client info
      clientName,
      clientAddress,
      clientGST,
      clientPhone,
      clientEmail,
      
      // Project info
      projectId: projectId ? parseInt(projectId) : null,
      projectName,
      projectLocation,
      workOrderNo,
      
      // Additional charges
      labourCharges: parseFloat(labourCharges || 0),
      transportCharges: parseFloat(transportCharges || 0),
      otherCharges: parseFloat(otherCharges || 0),
      otherChargesDescription,
      
      // Tax percentages
      cgstPercent: parseFloat(cgst || 0),
      sgstPercent: parseFloat(sgst || 0),
      igstPercent: parseFloat(igst || 0),
      tdsPercent: parseFloat(tds || 0),
      retentionPercent: parseFloat(retention || 0),
      
      // Calculated amounts
      cgstAmount,
      sgstAmount,
      igstAmount,
      tdsAmount,
      retentionAmount,
      
      // Payment info
      advancePaid: parseFloat(advancePaid || 0),
      previousBills: parseFloat(previousBills || 0),
      
      // Totals
      subtotal,
      grossAmount,
      totalWithTax,
      netPayable,
      
      // Additional info
      remarks,
      termsAndConditions,
      
      // Metadata
      companyId,
      status: 'DRAFT',
      createdBy: createdBy,
      updatedAt: new Date(),

      // Create bill items
      BillItem: {
        create: items
          .filter(item => item.description && item.description.trim() !== '')
          .map((item, index) => ({
            sno: item.sno || index + 1,
            description: item.description,
            unit: item.unit,
            quantity: parseFloat(item.quantity || 0),
            rate: parseFloat(item.rate || 0),
            amount: parseFloat(item.amount || 0),
            updatedAt: new Date(),
          })),
      },
    };

    // Create bill with items
    const bill = await prisma.bill.create({
      data: billData,
      include: {
        BillItem: {
          orderBy: { sno: 'asc' }
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      bill,
    });

  } catch (error) {
    console.error('Error creating bill:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create bill',
      details: error.message,
    });
  }
};

// ========== GET ALL BILLS ==========
export const getAllBills = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { status, projectId, startDate, endDate, limit = 50, page = 1 } = req.query;

    const where = { companyId };

    if (status) where.status = status;
    if (projectId) where.projectId = parseInt(projectId);
    if (startDate || endDate) {
      where.billDate = {};
      if (startDate) where.billDate.gte = new Date(startDate);
      if (endDate) where.billDate.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ✅ FIXED: Changed lowercase 'project' and 'creator' to their correct Prisma relation names
    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          BillItem: { orderBy: { sno: 'asc' } },
          // ✅ Use the correct relation name from your Prisma schema
          // Change 'project' to 'Project' if that's the relation name
          // Change 'creator' to 'User' if that's the relation name
          ...(projectId && {
            Project: { select: { id: true, name: true, projectId: true } }
          }),
          User: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip,
      }),
      prisma.bill.count({ where })
    ]);

    res.json({
      success: true,
      bills,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch bills',
      details: error.message 
    });
  }
};

// ========== GET BILL BY ID ==========
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const bill = await prisma.bill.findFirst({
      where: { id: parseInt(id), companyId },
      include: {
        BillItem: { orderBy: { sno: 'asc' } },
        // ✅ Use correct relation names
        Project: true,
        User: { select: { id: true, name: true, email: true } }
      }
    });

    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    res.json({ success: true, bill });
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch bill',
      details: error.message 
    });
  }
};

// ========== GET BILLS BY PROJECT ==========
export const getBillsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const companyId = req.user.companyId;

    const bills = await prisma.bill.findMany({
      where: { projectId: parseInt(projectId), companyId },
      include: {
        BillItem: { orderBy: { sno: 'asc' } },
        User: { select: { id: true, name: true, email: true } }
      },
      orderBy: { billDate: 'desc' }
    });

    const summary = {
      totalBills: bills.length,
      totalBilled: bills.reduce((sum, bill) => sum + bill.netPayable, 0),
      paidBills: bills.filter(b => b.status === 'PAID').length,
      pendingBills: bills.filter(b => b.status === 'SENT' || b.status === 'DRAFT').length,
      overdueBills: bills.filter(b => b.status === 'OVERDUE').length,
    };

    res.json({ success: true, bills, summary });
  } catch (error) {
    console.error('Error fetching project bills:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch project bills',
      details: error.message 
    });
  }
};

// ========== UPDATE BILL STATUS ==========
export const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const companyId = req.user.companyId;

    const validStatuses = ['DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const bill = await prisma.bill.updateMany({
      where: { id: parseInt(id), companyId },
      data: { status, updatedAt: new Date() }
    });

    if (bill.count === 0) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    res.json({ success: true, message: `Bill status updated to ${status}` });
  } catch (error) {
    console.error('Error updating bill status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update bill status',
      details: error.message 
    });
  }
};

// ========== UPDATE BILL ==========
export const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    
    // Check if bill exists
    const existingBill = await prisma.bill.findFirst({
      where: { id: parseInt(id), companyId }
    });

    if (!existingBill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    // Update logic here (simplified for now)
    res.json({ success: true, message: 'Update endpoint ready' });
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update bill',
      details: error.message 
    });
  }
};

// ========== DELETE BILL ==========
export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const bill = await prisma.bill.findFirst({
      where: { id: parseInt(id), companyId }
    });

    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    await prisma.bill.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete bill',
      details: error.message 
    });
  }
};