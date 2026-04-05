/**
 * FrostOps ERP — Backend Server
 * Runs on Node.js with zero npm dependencies.
 * Uses built-in http + fs modules. Data stored in db.json
 *
 * Start: node server.js
 * Open:  http://localhost:3000
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT    = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// ─── DB HELPERS ────────────────────────────────────────────
function loadDB() {
  if (!fs.existsSync(DB_FILE)) return seedDB();
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch(e) { console.error('DB read error, re-seeding'); return seedDB(); }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random()*9000+1000)}`;
}

function seedDB() {
  const db = {
    settings: {
      company: 'FrostOps Frozen Foods LLC',
      vat: 'VAT-300123456700003',
      country: 'Saudi Arabia',
      currency: 'SAR',
      lowStockPct: 30,
      expiryDays: 30
    },
    products: [
      { id:'PROD-001', name:'Chicken Nuggets', sku:'SKU-CN-1KG', variant:'1kg', category:'Finished Goods', subcat:'Poultry', sellingPrice:47.00, storageTemp:'-18°C', shelfMonths:12, unit:'Box', description:'Crispy breaded chicken nuggets, IQF', active:true },
      { id:'PROD-002', name:'Fish Fingers',    sku:'SKU-FF-500G', variant:'500g', category:'Finished Goods', subcat:'Seafood', sellingPrice:33.50, storageTemp:'-18°C', shelfMonths:18, unit:'Box', description:'Golden battered fish fingers', active:true },
      { id:'PROD-003', name:'Beef Burgers',    sku:'SKU-BB-4PK',  variant:'4-pack', category:'Finished Goods', subcat:'Meat', sellingPrice:52.50, storageTemp:'-18°C', shelfMonths:12, unit:'Box', description:'100% beef burger patties', active:true },
      { id:'PROD-004', name:'Frozen Peas',     sku:'SKU-FP-500G', variant:'500g', category:'Finished Goods', subcat:'Vegetables', sellingPrice:13.00, storageTemp:'-18°C', shelfMonths:24, unit:'Bag', description:'Garden fresh frozen peas', active:true },
      { id:'PROD-005', name:'Cheese Pizza',    sku:'SKU-CP-400G', variant:'400g', category:'Finished Goods', subcat:'Ready Meals', sellingPrice:37.00, storageTemp:'-18°C', shelfMonths:9, unit:'Box', description:'Margherita frozen pizza', active:true },
      { id:'PROD-006', name:'Shrimp Cocktail', sku:'SKU-SC-300G', variant:'300g', category:'Finished Goods', subcat:'Seafood', sellingPrice:67.50, storageTemp:'-22°C', shelfMonths:6, unit:'Pack', description:'Cooked & peeled shrimp', active:true },
    ],
    rawMaterials: [
      { id:'RM-001', name:'Chicken Breast (raw)', sku:'RM-CHK-001', category:'Poultry', unit:'kg', costPerUnit:18.00, supplier:'Gulf Poultry Co.', minStock:500, currentStock:1200, storageTemp:'-18°C', active:true },
      { id:'RM-002', name:'White Fish Fillet',    sku:'RM-FSH-001', category:'Seafood', unit:'kg', costPerUnit:24.00, supplier:'Red Sea Seafood', minStock:300, currentStock:280, storageTemp:'-22°C', active:true },
      { id:'RM-003', name:'Beef Mince 80/20',     sku:'RM-BEF-001', category:'Meat', unit:'kg', costPerUnit:32.00, supplier:'Saudi Beef Trading', minStock:400, currentStock:150, storageTemp:'-18°C', active:true },
      { id:'RM-004', name:'Bread Crumbs',         sku:'RM-BRD-001', category:'Dry Goods', unit:'kg', costPerUnit:4.50, supplier:'Al Marai Supplies', minStock:200, currentStock:620, storageTemp:'Ambient', active:true },
      { id:'RM-005', name:'Frozen Peas (bulk)',   sku:'RM-PEA-001', category:'Vegetables', unit:'kg', costPerUnit:5.00, supplier:'Green Valley Veg', minStock:1000, currentStock:3500, storageTemp:'-18°C', active:true },
      { id:'RM-006', name:'Pizza Dough Base',     sku:'RM-PDG-001', category:'Bakery', unit:'pcs', costPerUnit:2.20, supplier:'Gulf Bakery Co.', minStock:500, currentStock:900, storageTemp:'-5°C', active:true },
    ],
    inventory: [
      { id:'INV-001', productId:'PROD-001', productName:'Chicken Nuggets 1kg', sku:'SKU-CN-1KG', category:'Finished Goods', qty:180, unit:'Box', costPerUnit:28.00, zone:'WH-A Zone 1 · -18°C', batch:'BCH-2025-001', expiryDate:'2025-09-15', minQty:50, status:'In Stock' },
      { id:'INV-002', productId:'PROD-002', productName:'Fish Fingers 500g',   sku:'SKU-FF-500G', category:'Finished Goods', qty:28,  unit:'Box', costPerUnit:20.00, zone:'WH-A Zone 1 · -18°C', batch:'BCH-2025-002', expiryDate:'2026-01-10', minQty:40, status:'Low Stock' },
      { id:'INV-003', productId:'PROD-003', productName:'Beef Burgers 4pk',    sku:'SKU-BB-4PK',  category:'Finished Goods', qty:32,  unit:'Box', costPerUnit:34.00, zone:'WH-A Zone 2 · -22°C', batch:'BCH-2025-003', expiryDate:'2025-11-20', minQty:60, status:'Low Stock' },
      { id:'INV-004', productId:'PROD-004', productName:'Frozen Peas 500g',    sku:'SKU-FP-500G', category:'Finished Goods', qty:350, unit:'Bag', costPerUnit:8.00,  zone:'WH-B Zone 1 · -5°C',  batch:'BCH-2024-095', expiryDate:'2025-05-15', minQty:100, status:'In Stock' },
      { id:'INV-005', productId:'PROD-005', productName:'Cheese Pizza 400g',   sku:'SKU-CP-400G', category:'Finished Goods', qty:200, unit:'Box', costPerUnit:22.00, zone:'WH-A Zone 1 · -18°C', batch:'BCH-2024-091', expiryDate:'2025-06-28', minQty:80, status:'In Stock' },
      { id:'INV-006', productId:'PROD-006', productName:'Shrimp Cocktail 300g',sku:'SKU-SC-300G', category:'Finished Goods', qty:5,   unit:'Pack', costPerUnit:45.00, zone:'WH-A Zone 2 · -22°C', batch:'BCH-2024-089', expiryDate:'2025-04-12', minQty:50, status:'Low Stock' },
    ],
    customers: [
      { id:'CUST-001', name:'FreshMart UAE',     contact:'Ahmed Al Rashid',   email:'ahmed@freshmart.ae',   phone:'+971501234567', country:'UAE',          creditLimit:50000, balance:4200,  terms:'Net 30', status:'Active' },
      { id:'CUST-002', name:'CoolStore KSA',     contact:'Sara Al Ghamdi',    email:'sara@coolstore.sa',    phone:'+966551234567', country:'Saudi Arabia', creditLimit:80000, balance:1850,  terms:'Net 30', status:'Active' },
      { id:'CUST-003', name:'Arctic Foods Ltd',  contact:'Mohammed Al Farsi', email:'m@arctic.qa',          phone:'+97444234567',  country:'Qatar',        creditLimit:60000, balance:0,     terms:'Net 60', status:'Active' },
      { id:'CUST-004', name:'IceMart Qatar',     contact:'Laila Hassan',      email:'laila@icemart.qa',     phone:'+97450234567',  country:'Qatar',        creditLimit:40000, balance:3400,  terms:'Net 30', status:'Active' },
      { id:'CUST-005', name:'Polar Foods Bahrain',contact:'Yousef Al Khalifa',email:'y@polarfoods.bh',      phone:'+97333234567',  country:'Bahrain',      creditLimit:30000, balance:0,     terms:'Cash',   status:'Active' },
    ],
    suppliers: [
      { id:'SUP-001', name:'Gulf Poultry Co.',   contact:'Ali Hassan',       email:'ali@gulfpoultry.com', phone:'+966501111111', category:'Poultry',   leadDays:7,  rating:4.8, paymentTerms:'Net 30', balance:4000, status:'Active' },
      { id:'SUP-002', name:'Red Sea Seafood',    contact:'Fatima Al Balawi', email:'f@redsea.sa',         phone:'+966502222222', category:'Seafood',   leadDays:5,  rating:4.5, paymentTerms:'Net 30', balance:2400, status:'Active' },
      { id:'SUP-003', name:'Saudi Beef Trading', contact:'Omar Al Ghamdi',   email:'omar@sbt.sa',         phone:'+966503333333', category:'Meat',      leadDays:10, rating:4.2, paymentTerms:'Net 60', balance:0,    status:'Active' },
      { id:'SUP-004', name:'Green Valley Veg',   contact:'Nour Al Shehri',   email:'nour@gvv.sa',         phone:'+966504444444', category:'Vegetables',leadDays:3,  rating:4.6, paymentTerms:'Net 15', balance:0,    status:'Active' },
      { id:'SUP-005', name:'Al Marai Supplies',  contact:'Khalid Al Otaibi', email:'k@almarai.sa',        phone:'+966505555555', category:'Dry Goods', leadDays:4,  rating:4.3, paymentTerms:'Cash',   balance:0,    status:'Active' },
    ],
    salesOrders: [
      { id:'SO-1024', date:'2025-04-01', customerId:'CUST-001', customerName:'FreshMart UAE',     items:[{productId:'PROD-001',productName:'Chicken Nuggets 1kg',qty:50,unitPrice:47,total:2350},{productId:'PROD-002',productName:'Fish Fingers 500g',qty:50,unitPrice:33.5,total:1675}], subtotal:4025, tax:603.75, total:4628.75, payment:'Bank Transfer', status:'Shipped',    deliveryDate:'2025-04-05', notes:'' },
      { id:'SO-1025', date:'2025-04-02', customerId:'CUST-002', customerName:'CoolStore KSA',     items:[{productId:'PROD-003',productName:'Beef Burgers 4pk',qty:20,unitPrice:52.5,total:1050},{productId:'PROD-004',productName:'Frozen Peas 500g',qty:100,unitPrice:13,total:1300}], subtotal:2350, tax:352.50, total:2702.50, payment:'Credit 30 Days', status:'Processing', deliveryDate:'2025-04-08', notes:'' },
      { id:'SO-1026', date:'2025-04-03', customerId:'CUST-003', customerName:'Arctic Foods Ltd',  items:[{productId:'PROD-006',productName:'Shrimp Cocktail 300g',qty:80,unitPrice:67.5,total:5400},{productId:'PROD-005',productName:'Cheese Pizza 400g',qty:50,unitPrice:37,total:1850}], subtotal:7250, tax:1087.50, total:8337.50, payment:'Net 30', status:'Pending',    deliveryDate:'2025-04-10', notes:'Cold chain required' },
      { id:'SO-1027', date:'2025-04-04', customerId:'CUST-004', customerName:'IceMart Qatar',     items:[{productId:'PROD-001',productName:'Chicken Nuggets 1kg',qty:80,unitPrice:47,total:3760}], subtotal:3760, tax:564, total:4324, payment:'Bank Transfer', status:'Processing', deliveryDate:'2025-04-09', notes:'' },
      { id:'SO-1028', date:'2025-03-28', customerId:'CUST-001', customerName:'FreshMart UAE',     items:[{productId:'PROD-004',productName:'Frozen Peas 500g',qty:200,unitPrice:13,total:2600}], subtotal:2600, tax:390, total:2990, payment:'Cash', status:'Delivered',  deliveryDate:'2025-04-02', notes:'' },
    ],
    purchases: [
      { id:'PO-2025-001', date:'2025-04-01', supplierId:'SUP-001', supplierName:'Gulf Poultry Co.',   items:[{name:'Chicken Breast (raw)',qty:500,unit:'kg',unitPrice:18,total:9000}], subtotal:9000, tax:1350, total:10350, terms:'Net 30', status:'Received',  expectedDate:'2025-04-08', notes:'' },
      { id:'PO-2025-002', date:'2025-04-02', supplierId:'SUP-002', supplierName:'Red Sea Seafood',    items:[{name:'White Fish Fillet',  qty:200,unit:'kg',unitPrice:24,total:4800}], subtotal:4800, tax:720,  total:5520,  terms:'Net 30', status:'Approved',  expectedDate:'2025-04-07', notes:'' },
      { id:'PO-2025-003', date:'2025-03-25', supplierId:'SUP-003', supplierName:'Saudi Beef Trading', items:[{name:'Beef Mince 80/20',   qty:300,unit:'kg',unitPrice:32,total:9600}], subtotal:9600, tax:1440, total:11040, terms:'Net 60', status:'Pending',   expectedDate:'2025-04-10', notes:'' },
    ],
    invoices: [
      { id:'INV-A001', date:'2025-04-01', dueDate:'2025-05-01', customerId:'CUST-001', customerName:'FreshMart UAE',    orderId:'SO-1024', subtotal:4025,  tax:603.75,  total:4628.75, paid:0,       status:'Unpaid',   notes:'' },
      { id:'INV-A002', date:'2025-04-02', dueDate:'2025-05-02', customerId:'CUST-002', customerName:'CoolStore KSA',    orderId:'SO-1025', subtotal:2350,  tax:352.50,  total:2702.50, paid:1000,    status:'Partial',  notes:'' },
      { id:'INV-A003', date:'2025-03-15', dueDate:'2025-04-15', customerId:'CUST-003', customerName:'Arctic Foods Ltd', orderId:'SO-1026', subtotal:7250,  tax:1087.50, total:8337.50, paid:8337.50, status:'Paid',     notes:'' },
      { id:'INV-A004', date:'2025-03-10', dueDate:'2025-04-10', customerId:'CUST-004', customerName:'IceMart Qatar',    orderId:'SO-1027', subtotal:3760,  tax:564,     total:4324,    paid:0,       status:'Overdue',  notes:'' },
    ],
    supplierBills: [
      { id:'BILL-001', date:'2025-04-01', dueDate:'2025-05-01', supplierId:'SUP-001', supplierName:'Gulf Poultry Co.',   purchaseId:'PO-2025-001', total:10350, paid:0,     status:'Unpaid' },
      { id:'BILL-002', date:'2025-04-02', dueDate:'2025-05-02', supplierId:'SUP-002', supplierName:'Red Sea Seafood',    purchaseId:'PO-2025-002', total:5520,  paid:5520,  status:'Paid' },
      { id:'BILL-003', date:'2025-03-25', dueDate:'2025-05-24', supplierId:'SUP-003', supplierName:'Saudi Beef Trading', purchaseId:'PO-2025-003', total:11040, paid:0,     status:'Unpaid' },
    ],
    expenses: [
      { id:'EXP-001', date:'2025-04-01', category:'Utilities',    description:'Cold storage electricity bill Q1',    amount:12000, paidBy:'Bank Transfer' },
      { id:'EXP-002', date:'2025-03-28', category:'Maintenance',  description:'Freezer unit service WH-A',          amount:3200,  paidBy:'Cheque' },
      { id:'EXP-003', date:'2025-03-25', category:'Logistics',    description:'Refrigerated truck rental x4',       amount:5600,  paidBy:'Bank Transfer' },
      { id:'EXP-004', date:'2025-03-20', category:'Packaging',    description:'Insulated packaging materials',      amount:8400,  paidBy:'Bank Transfer' },
      { id:'EXP-005', date:'2025-03-01', category:'Salaries',     description:'March payroll',                      amount:86400, paidBy:'Bank Transfer' },
    ],
    production: [
      { id:'BCH-001', productId:'PROD-001', productName:'Chicken Nuggets 1kg', plannedQty:1000, producedQty:980, startDate:'2025-04-01', endDate:'2025-04-02', assignedTo:'Team A', qcStatus:'Passed', status:'Completed', notes:'' },
      { id:'BCH-002', productId:'PROD-002', productName:'Fish Fingers 500g',   plannedQty:800,  producedQty:0,   startDate:'2025-04-04', endDate:'2025-04-05', assignedTo:'Team B', qcStatus:'Pending', status:'In Progress', notes:'' },
      { id:'BCH-003', productId:'PROD-003', productName:'Beef Burgers 4pk',    plannedQty:600,  producedQty:0,   startDate:'2025-04-06', endDate:'2025-04-07', assignedTo:'Team A', qcStatus:'Pending', status:'Planned', notes:'' },
    ]
  };
  saveDB(db);
  return db;
}

// ─── MIME TYPES ─────────────────────────────────────────────
const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
};

// ─── RESPONSE HELPERS ───────────────────────────────────────
function json(res, data, code=200) {
  res.writeHead(code, { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' });
  res.end(JSON.stringify(data));
}

function err(res, msg, code=400) {
  json(res, { error: msg }, code);
}

function body(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch(e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// ─── ROUTER ─────────────────────────────────────────────────
const routes = [];
function route(method, pattern, handler) {
  routes.push({ method, pattern: new RegExp('^' + pattern.replace(':id', '([^/]+)') + '$'), handler });
}

function matchRoute(method, url) {
  for (const r of routes) {
    if (r.method !== method && r.method !== '*') continue;
    const m = url.match(r.pattern);
    if (m) return { handler: r.handler, id: m[1] || null };
  }
  return null;
}

// ─── CRUD FACTORY ───────────────────────────────────────────
function crud(collection, prefix, validators={}) {
  // GET all
  route('GET', `/api/${collection}`, (req, res) => {
    const db = loadDB();
    json(res, db[collection] || []);
  });

  // GET one
  route('GET', `/api/${collection}/:id`, (req, res, id) => {
    const db = loadDB();
    const item = (db[collection]||[]).find(i => i.id === id);
    if (!item) return err(res, 'Not found', 404);
    json(res, item);
  });

  // POST create
  route('POST', `/api/${collection}`, async (req, res) => {
    const db = loadDB();
    const data = await body(req);
    if (validators.create) {
      const e = validators.create(data, db);
      if (e) return err(res, e);
    }
    const item = { id: uid(prefix), ...data, createdAt: new Date().toISOString() };
    db[collection] = db[collection] || [];
    db[collection].push(item);
    // hooks
    if (validators.afterCreate) validators.afterCreate(item, db);
    saveDB(db);
    json(res, item, 201);
  });

  // PUT update
  route('PUT', `/api/${collection}/:id`, async (req, res, id) => {
    const db = loadDB();
    const idx = (db[collection]||[]).findIndex(i => i.id === id);
    if (idx === -1) return err(res, 'Not found', 404);
    const data = await body(req);
    db[collection][idx] = { ...db[collection][idx], ...data, updatedAt: new Date().toISOString() };
    if (validators.afterUpdate) validators.afterUpdate(db[collection][idx], db);
    saveDB(db);
    json(res, db[collection][idx]);
  });

  // DELETE
  route('DELETE', `/api/${collection}/:id`, (req, res, id) => {
    const db = loadDB();
    const before = (db[collection]||[]).length;
    db[collection] = (db[collection]||[]).filter(i => i.id !== id);
    if (db[collection].length === before) return err(res, 'Not found', 404);
    saveDB(db);
    json(res, { ok: true });
  });
}

// ─── ROUTES ─────────────────────────────────────────────────

crud('products',     'PROD');
crud('rawMaterials', 'RM');
crud('customers',    'CUST');
crud('suppliers',    'SUP');
crud('inventory',    'INV');
crud('expenses',     'EXP');
crud('production',   'BCH');

// Sales Orders — with invoice auto-creation
crud('salesOrders', 'SO', {
  afterCreate: (order, db) => {
    const invoice = {
      id: uid('INV-A'),
      date: order.date || new Date().toISOString().split('T')[0],
      dueDate: addDays(order.date || today(), 30),
      customerId: order.customerId,
      customerName: order.customerName,
      orderId: order.id,
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      total: order.total || 0,
      paid: 0,
      status: 'Unpaid',
      notes: '',
      createdAt: new Date().toISOString()
    };
    db.invoices = db.invoices || [];
    db.invoices.push(invoice);
  }
});

// Purchases — with bill auto-creation
crud('purchases', 'PO', {
  afterCreate: (po, db) => {
    const bill = {
      id: uid('BILL'),
      date: po.date || today(),
      dueDate: addDays(po.date || today(), 30),
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      purchaseId: po.id,
      total: po.total || 0,
      paid: 0,
      status: 'Unpaid',
      createdAt: new Date().toISOString()
    };
    db.supplierBills = db.supplierBills || [];
    db.supplierBills.push(bill);
  }
});

// Invoices
crud('invoices',      'INV-A');
crud('supplierBills', 'BILL');

// Mark invoice paid
route('POST', '/api/invoices/:id/pay', async (req, res, id) => {
  const db = loadDB();
  const inv = db.invoices.find(i => i.id === id);
  if (!inv) return err(res, 'Not found', 404);
  const data = await body(req);
  const payment = parseFloat(data.amount) || inv.total;
  inv.paid = Math.min((inv.paid||0) + payment, inv.total);
  inv.status = inv.paid >= inv.total ? 'Paid' : inv.paid > 0 ? 'Partial' : 'Unpaid';
  if (inv.paid >= inv.total) inv.paidDate = today();
  // Update customer balance
  const cust = db.customers.find(c => c.id === inv.customerId);
  if (cust) cust.balance = Math.max(0, (cust.balance||0) - payment);
  saveDB(db);
  json(res, inv);
});

// Mark supplier bill paid
route('POST', '/api/supplierBills/:id/pay', async (req, res, id) => {
  const db = loadDB();
  const bill = db.supplierBills.find(b => b.id === id);
  if (!bill) return err(res, 'Not found', 404);
  const data = await body(req);
  const payment = parseFloat(data.amount) || bill.total;
  bill.paid = Math.min((bill.paid||0) + payment, bill.total);
  bill.status = bill.paid >= bill.total ? 'Paid' : 'Partial';
  const sup = db.suppliers.find(s => s.id === bill.supplierId);
  if (sup) sup.balance = Math.max(0, (sup.balance||0) - payment);
  saveDB(db);
  json(res, bill);
});

// Dashboard summary
route('GET', '/api/dashboard', (req, res) => {
  const db = loadDB();

  const invValue = db.inventory.reduce((s,i) => s + (i.qty||0)*(i.costPerUnit||0), 0);
  const receivables = db.invoices.filter(i=>i.status!=='Paid').reduce((s,i)=>s+(i.total||0)-(i.paid||0),0);
  const payables = db.supplierBills.filter(b=>b.status!=='Paid').reduce((s,b)=>s+(b.total||0)-(b.paid||0),0);
  const paidInv = db.invoices.filter(i=>i.status==='Paid');
  const revenue = paidInv.reduce((s,i)=>s+(i.total||0),0);
  const expenses = db.expenses.reduce((s,e)=>s+(e.amount||0),0);
  const lowStock = db.inventory.filter(i=>i.status!=='In Stock');
  const expiring = db.inventory.filter(i=>i.expiryDate && daysUntil(i.expiryDate)<30);
  const overdueAR = db.invoices.filter(i=>i.status==='Overdue');
  const overdueBills = db.supplierBills.filter(b=>b.status!=='Paid' && daysUntil(b.dueDate)<0);

  const now = new Date();
  const months = [];
  for(let i=7;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    months.push({ label: d.toLocaleString('en',{month:'short'}), year: d.getFullYear(), month: d.getMonth() });
  }
  const revenueChart = months.map(m => {
    const rev = db.invoices.filter(i=>{
      if(i.status!=='Paid') return false;
      const d = new Date(i.date);
      return d.getMonth()===m.month && d.getFullYear()===m.year;
    }).reduce((s,i)=>s+i.total,0);
    return { label: m.label, value: Math.round(rev) };
  });

  json(res, {
    invValue, receivables, payables, revenue, expenses,
    netProfit: revenue - expenses,
    lowStockCount: lowStock.length,
    expiringCount: expiring.length,
    overdueARCount: overdueAR.length,
    overdueBillsCount: overdueBills.length,
    totalCustomers: db.customers.length,
    totalSuppliers: db.suppliers.length,
    totalProducts: db.products.length,
    pendingOrders: db.salesOrders.filter(o=>o.status==='Pending').length,
    revenueChart,
    recentOrders: db.salesOrders.slice(-5).reverse(),
    lowStockItems: lowStock.slice(0,6),
    expiringItems: expiring.slice(0,6),
    overdueAR: overdueAR,
    overdueBills: overdueBills,
  });
});

// Settings
route('GET', '/api/settings', (req, res) => {
  json(res, loadDB().settings);
});
route('PUT', '/api/settings', async (req, res) => {
  const db = loadDB();
  const data = await body(req);
  db.settings = { ...db.settings, ...data };
  saveDB(db);
  json(res, db.settings);
});

// Receivables summary
route('GET', '/api/receivables', (req, res) => {
  const db = loadDB();
  const rows = db.customers.map(c => {
    const unpaidInvoices = db.invoices.filter(i => i.customerId === c.id && i.status !== 'Paid');
    const total = unpaidInvoices.reduce((s,i)=>s+(i.total-i.paid),0);
    const overdue = unpaidInvoices.filter(i=>daysUntil(i.dueDate)<0).reduce((s,i)=>s+(i.total-i.paid),0);
    return { ...c, totalReceivable: total, overdueAmount: overdue, invoiceCount: unpaidInvoices.length };
  }).filter(c=>c.totalReceivable>0);
  json(res, rows);
});

// Payables summary
route('GET', '/api/payables', (req, res) => {
  const db = loadDB();
  const rows = db.suppliers.map(s => {
    const unpaidBills = db.supplierBills.filter(b => b.supplierId === s.id && b.status !== 'Paid');
    const total = unpaidBills.reduce((s,b)=>s+(b.total-b.paid),0);
    const overdue = unpaidBills.filter(b=>daysUntil(b.dueDate)<0).reduce((s,b)=>s+(b.total-b.paid),0);
    return { ...s, totalPayable: total, overdueAmount: overdue, billCount: unpaidBills.length };
  }).filter(s=>s.totalPayable>0);
  json(res, rows);
});

// ─── UTILITY FUNCTIONS ─────────────────────────────────────
function today() { return new Date().toISOString().split('T')[0]; }
function daysUntil(d) {
  if(!d) return 999;
  return Math.round((new Date(d+'T12:00:00') - new Date()) / 86400000);
}
function addDays(dateStr, days) {
  const d = new Date(dateStr+'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─── HTTP SERVER ────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // API routes
  if (url.startsWith('/api/')) {
    const match = matchRoute(req.method, url);
    if (match) {
      Promise.resolve(match.handler(req, res, match.id)).catch(e => {
        console.error(e);
        err(res, 'Server error', 500);
      });
    } else {
      err(res, 'Not found', 404);
    }
    return;
  }

  // Static files — serve frontend
  let filePath = path.join(__dirname, 'public', url === '/' ? 'index.html' : url);
  const ext = path.extname(filePath);
  if (!ext) filePath += '.html';

  fs.readFile(filePath, (e, data) => {
    if (e) {
      // Fallback to index.html for SPA routing
      fs.readFile(path.join(__dirname, 'public', 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(d2);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n❄️  FrostOps ERP is running!`);
  console.log(`   Open: http://localhost:${PORT}\n`);
});
