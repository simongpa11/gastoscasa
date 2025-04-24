import React, { useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

const ExpenseTracker = () => {
  // Estado para pestañas
  const [activeTab, setActiveTab] = useState('analytics');
  const [yearTabs, setYearTabs] = useState([
    { id: 'tab-2025', name: '2025', year: '2025' }
  ]);
  
  // Estado para ordenación de transacciones
  const [transactionSort, setTransactionSort] = useState('desc'); // 'desc' (más reciente primero) o 'asc' (más antiguo primero)
  
  // Estados para drag and drop de pestañas
  const [draggedTab, setDraggedTab] = useState(null);
  const [dragOverTab, setDragOverTab] = useState(null);
  
  // Estado para modal de nueva pestaña
  const [showNewTabModal, setShowNewTabModal] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [newTabYear, setNewTabYear] = useState('');
  
  // Estado para categorías
  const [categories, setCategories] = useState([
    { id: 1, name: 'Hogar', subcategories: ['Alquiler', 'Luz', 'Agua', 'Internet'], color: '#4F46E5' },
    { id: 2, name: 'Alimentación', subcategories: ['Supermercado', 'Restaurantes'], color: '#10B981' },
    { id: 3, name: 'Transporte', subcategories: ['Gasolina', 'Transporte público', 'Mantenimiento'], color: '#F59E0B' },
    { id: 4, name: 'Ocio', subcategories: ['Cine', 'Viajes', 'Suscripciones'], color: '#EC4899' }
  ]);
  
  // Estado para formularios y filtros
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  
  // Estado para transacciones
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'expense', amount: 800, category: 'Hogar', subcategory: 'Alquiler', description: 'Alquiler mensual', date: '2025-01-01', year: '2025' },
    { id: 2, type: 'expense', amount: 120, category: 'Hogar', subcategory: 'Luz', description: 'Factura de luz', date: '2025-01-15', year: '2025' },
    { id: 3, type: 'expense', amount: 200, category: 'Alimentación', subcategory: 'Supermercado', description: 'Compra semanal', date: '2025-01-10', year: '2025' },
    { id: 4, type: 'income', amount: 2500, category: 'Ingresos', subcategory: 'Salario', description: 'Nómina enero', date: '2025-01-30', year: '2025' },
    { id: 5, type: 'expense', amount: 150, category: 'Ocio', subcategory: 'Cine', description: 'Entradas y palomitas', date: '2025-02-05', year: '2025' },
    { id: 6, type: 'income', amount: 2500, category: 'Ingresos', subcategory: 'Salario', description: 'Nómina febrero', date: '2025-02-28', year: '2025' },
    { id: 7, type: 'expense', amount: 180, category: 'Alimentación', subcategory: 'Supermercado', description: 'Compra semanal', date: '2025-02-10', year: '2025' },
    { id: 8, type: 'expense', amount: 220, category: 'Transporte', subcategory: 'Gasolina', description: 'Gasolina coche', date: '2025-03-05', year: '2025' }
  ]);
  
  // Estado para nueva transacción
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: '',
    subcategory: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Estado para confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ 
    type: '', // category, subcategory, transaction, tab
    id: null,
    categoryId: null,
    name: '',
    tabId: null
  });
  
  // Función para agregar una nueva pestaña
  const openNewTabModal = () => {
    const currentYear = new Date().getFullYear().toString();
    setNewTabYear(currentYear);
    setNewTabName(`Año ${currentYear}`);
    setShowNewTabModal(true);
  };
  
  const addNewTab = () => {
    if (newTabName.trim() !== '' && newTabYear.trim() !== '') {
      const newTabId = `tab-${Date.now()}`;
      setYearTabs([...yearTabs, { 
        id: newTabId, 
        name: newTabName, 
        year: newTabYear 
      }]);
      setActiveTab(newTabId);
      setShowNewTabModal(false);
      setNewTabName('');
      setNewTabYear('');
    }
  };
  
  // Función para eliminar una pestaña
  const confirmDeleteTab = (tabId, tabName) => {
    setDeleteTarget({ 
      type: 'tab', 
      id: tabId, 
      name: tabName 
    });
    setShowDeleteConfirm(true);
  };
  
  const deleteTab = (tabId) => {
    const updatedTabs = yearTabs.filter(tab => tab.id !== tabId);
    setYearTabs(updatedTabs);
    
    // Si se elimina la pestaña activa, activar la primera pestaña
    if (activeTab === tabId) {
      setActiveTab(updatedTabs.length > 0 ? updatedTabs[0].id : 'analytics');
    }
    
    setShowDeleteConfirm(false);
  };
  
  // Funciones para drag and drop de pestañas
  const handleDragStart = (e, tabId) => {
    setDraggedTab(tabId);
  };
  
  const handleDragOver = (e, tabId) => {
    e.preventDefault();
    if (draggedTab !== tabId) {
      setDragOverTab(tabId);
    }
  };
  
  const handleDrop = (e, targetTabId) => {
    e.preventDefault();
    if (draggedTab !== targetTabId) {
      const draggedTabIndex = yearTabs.findIndex(tab => tab.id === draggedTab);
      const targetTabIndex = yearTabs.findIndex(tab => tab.id === targetTabId);
      
      if (draggedTabIndex !== -1 && targetTabIndex !== -1) {
        const newTabs = [...yearTabs];
        const draggedTabItem = newTabs[draggedTabIndex];
        
        // Reordenar
        newTabs.splice(draggedTabIndex, 1);
        newTabs.splice(targetTabIndex, 0, draggedTabItem);
        
        setYearTabs(newTabs);
      }
    }
    setDraggedTab(null);
    setDragOverTab(null);
  };
  
  const handleDragEnd = () => {
    setDraggedTab(null);
    setDragOverTab(null);
  };
  
  // Función para añadir categoría
  const addCategory = () => {
    if (newCategory.trim() !== '') {
      const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
      setCategories([...categories, { 
        id: categories.length + 1, 
        name: newCategory, 
        subcategories: [],
        color: randomColor 
      }]);
      setNewCategory('');
    }
  };
  
  // Función para añadir subcategoría
  const addSubcategoryToExisting = () => {
    if (selectedCategory && newSubcategory.trim() !== '') {
      const updatedCategories = categories.map(cat => {
        if (cat.id === parseInt(selectedCategory)) {
          return { ...cat, subcategories: [...cat.subcategories, newSubcategory] };
        }
        return cat;
      });
      setCategories(updatedCategories);
      setNewSubcategory('');
    }
  };
  
  // Función para actualizar color de categoría
  const updateCategoryColor = (categoryId, newColor) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, color: newColor };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };
  
  // Funciones para eliminar
  const confirmDelete = (type, id, name, categoryId = null) => {
    setDeleteTarget({ type, id, categoryId, name });
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteTransaction = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      setDeleteTarget({ 
        type: 'transaction', 
        id: transactionId, 
        name: `${transaction.type === 'expense' ? 'Gasto' : 'Ingreso'} de ${transaction.amount}€` 
      });
      setShowDeleteConfirm(true);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  const deleteCategory = (categoryId) => {
    const categoryToDelete = categories.find(c => c.id === categoryId);
    if (!categoryToDelete) return;
    
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    const updatedTransactions = transactions.filter(t => t.category !== categoryToDelete.name);
    
    setCategories(updatedCategories);
    setTransactions(updatedTransactions);
    setShowDeleteConfirm(false);
  };
  
  const deleteSubcategory = (categoryId, subcategoryIndex) => {
    const categoryObj = categories.find(c => c.id === categoryId);
    if (!categoryObj) return;
    
    const subcategoryName = categoryObj.subcategories[subcategoryIndex];
    
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        const updatedSubcategories = [...cat.subcategories];
        updatedSubcategories.splice(subcategoryIndex, 1);
        return { ...cat, subcategories: updatedSubcategories };
      }
      return cat;
    });
    
    const updatedTransactions = transactions.map(t => {
      if (t.category === categoryObj.name && t.subcategory === subcategoryName) {
        return { ...t, subcategory: '' };
      }
      return t;
    });
    
    setCategories(updatedCategories);
    setTransactions(updatedTransactions);
    setShowDeleteConfirm(false);
  };
  
  const deleteTransaction = (transactionId) => {
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    setTransactions(updatedTransactions);
    setShowDeleteConfirm(false);
  };
  
  // Función para añadir transacción
  const addTransaction = () => {
    if (newTransaction.amount && newTransaction.category && newTransaction.date) {
      const year = new Date(newTransaction.date).getFullYear().toString();
      const updatedTransaction = {
        ...newTransaction,
        id: transactions.length + 1,
        year,
        amount: parseFloat(newTransaction.amount)
      };
      
      setTransactions([...transactions, updatedTransaction]);
      
      // Resetear formulario
      setNewTransaction({
        type: 'expense',
        amount: '',
        category: '',
        subcategory: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };
  
  // Obtener subcategorías
  const getSubcategories = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.subcategories : [];
  };
  
  // Obtener año de una pestaña
  const getTabYear = (tabId) => {
    const tab = yearTabs.find(tab => tab.id === tabId);
    return tab ? tab.year : null;
  };
  
  // Formatear fecha de mes/año
  const formatMonthYear = (dateString) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const [year, month] = dateString.split('-');
    return `${months[parseInt(month) - 1]} ${year}`;
  };
  
  // Obtener transacciones ordenadas
  const getSortedTransactions = (transactions) => {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return transactionSort === 'desc' ? dateB - dateA : dateA - dateB;
    });
  };
  
  // Filtrar transacciones
  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    if (activeTab !== 'analytics' && activeTab !== 'settings') {
      const yearForTab = getTabYear(activeTab);
      if (yearForTab) {
        filtered = filtered.filter(t => t.year === yearForTab);
      }
    }
    
    if (dateFilter.startDate) {
      filtered = filtered.filter(t => t.date >= dateFilter.startDate);
    }
    
    if (dateFilter.endDate) {
      filtered = filtered.filter(t => t.date <= dateFilter.endDate);
    }
    
    return getSortedTransactions(filtered);
  };
  
  // Cálculo de métricas
  const calculateMetrics = (transactions) => {
    // Totales
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    // Gastos por categoría y subcategoría
    const expensesByCategory = {};
    const expensesBySubcategory = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        // Por categoría
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        
        // Por subcategoría
        if (!expensesBySubcategory[t.category]) {
          expensesBySubcategory[t.category] = {};
        }
        
        if (t.subcategory) {
          expensesBySubcategory[t.category][t.subcategory] = 
            (expensesBySubcategory[t.category][t.subcategory] || 0) + t.amount;
        }
      });
    
    // Ingresos por categoría
    const incomeByCategory = {};
    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      });
    
    // Datos para gráficos
    const timelineData = [];
    const months = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { 
          name: monthKey, 
          displayName: formatMonthYear(monthKey),
          expenses: 0, 
          income: 0 
        };
      }
      
      if (t.type === 'expense') {
        months[monthKey].expenses += t.amount;
      } else {
        months[monthKey].income += t.amount;
      }
    });
    
    Object.values(months).forEach(month => {
      timelineData.push(month);
    });
    
    timelineData.sort((a, b) => a.name.localeCompare(b.name));
    
    const expensesChartData = Object.entries(expensesByCategory)
      .map(([category, amount]) => {
        const categoryObj = categories.find(c => c.name === category);
        return { 
          name: category, 
          amount,
          fill: categoryObj ? categoryObj.color : '#EF4444'
        };
      })
      .sort((a, b) => b.amount - a.amount);
    
    const incomeChartData = Object.entries(incomeByCategory)
      .map(([category, amount]) => {
        const categoryObj = categories.find(c => c.name === category);
        return { 
          name: category, 
          amount,
          fill: categoryObj ? categoryObj.color : '#10B981'
        };
      })
      .sort((a, b) => b.amount - a.amount);
    
    return {
      totalExpenses,
      totalIncome,
      balance,
      expensesByCategory,
      expensesBySubcategory,
      timelineData,
      expensesChartData,
      incomeChartData
    };
  };

  const filteredTransactions = getFilteredTransactions();
  const metrics = calculateMetrics(filteredTransactions);
  
  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">Control de Gastos</h1>
      
      {/* Navegación por pestañas */}
      <div className="flex mb-4 border-b border-gray-200 overflow-x-auto">
        <button
          className={`py-2 px-4 ${activeTab === 'analytics' ? 'bg-blue-500 text-white font-medium rounded-t-lg' : 'text-gray-600 hover:text-gray-800'}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analíticas
        </button>
        <button
          className={`py-2 px-4 ml-2 ${activeTab === 'settings' ? 'bg-blue-500 text-white font-medium rounded-t-lg' : 'text-gray-600 hover:text-gray-800'}`}
          onClick={() => setActiveTab('settings')}
        >
          Configuración
        </button>
        
        {yearTabs.map(tab => (
          <div 
            key={tab.id}
            className="relative flex items-center"
            draggable
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={(e) => handleDragOver(e, tab.id)}
            onDrop={(e) => handleDrop(e, tab.id)}
            onDragEnd={handleDragEnd}
          >
            <button
              className={`py-2 px-4 ml-2 flex items-center ${activeTab === tab.id ? 'bg-blue-500 text-white font-medium rounded-t-lg' : 'text-gray-600 hover:text-gray-800'} ${dragOverTab === tab.id ? 'border-2 border-dashed border-blue-400' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
              <button
                className="ml-2 text-sm hover:bg-red-200 rounded-full h-5 w-5 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDeleteTab(tab.id, tab.name);
                }}
              >
                ×
              </button>
            </button>
          </div>
        ))}
        
        <button
          className="py-2 px-4 ml-auto bg-green-500 text-white rounded-t-lg"
          onClick={openNewTabModal}
        >
          + Añadir
        </button>
      </div>
      
      {/* Pestaña de Analíticas */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Métricas Generales</h2>
          
          {/* Filtro de fechas */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm mb-1">Fecha Inicio</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Fecha Fin</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
              />
            </div>
          </div>
          
          {/* Tarjetas de métricas y Gastos por categoría - Fusionados */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Tarjetas de métricas - Ahora en una columna */}
            <div className="md:w-1/3 space-y-2">
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="text-sm text-gray-600">Ingresos</h3>
                <p className="text-xl font-bold text-green-600">{metrics.totalIncome.toFixed(2)}€</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <h3 className="text-sm text-gray-600">Gastos</h3>
                <p className="text-xl font-bold text-red-600">{metrics.totalExpenses.toFixed(2)}€</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="text-sm text-gray-600">Balance</h3>
                <p className={`text-xl font-bold ${metrics.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.balance.toFixed(2)}€
                </p>
              </div>
            </div>
            
            {/* Gastos por categoría - Ahora con más espacio */}
            <div className="md:w-2/3 border rounded-lg p-3">
              <h3 className="text-lg font-semibold mb-2">Gastos por Categoría</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {Object.entries(metrics.expensesByCategory).map(([category, amount]) => {
                  const categoryObj = categories.find(c => c.name === category);
                  const categoryColor = categoryObj ? categoryObj.color : '#EF4444';
                  
                  return (
                    <div key={category} className="border rounded-lg p-2 bg-gray-50">
                      <div className="flex justify-between items-center font-semibold mb-1">
                        <span className="flex items-center">
                          <span className="inline-block w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: categoryColor }}></span>
                          {category}
                        </span>
                        <span className="bg-gray-200 px-2 py-1 rounded">{amount.toFixed(2)}€</span>
                      </div>
                      {/* Subcategorías */}
                      {metrics.expensesBySubcategory[category] && (
                        <div className="pl-5 space-y-1">
                          {Object.entries(metrics.expensesBySubcategory[category]).map(([subcategory, subAmount]) => (
                            <div key={subcategory} className="flex justify-between items-center text-sm text-gray-600">
                              <span>└ {subcategory}</span>
                              <span className="bg-gray-100 px-2 rounded">{subAmount.toFixed(2)}€</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Gráfico de barras comparativo de ingresos y gastos por mes */}
          <h3 className="text-lg font-semibold mt-6 mb-2">Comparativa de Ingresos y Gastos por Mes</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayName" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(2)}€`} />
                <Legend />
                <Bar dataKey="income" name="Ingresos" fill="#10B981" />
                <Bar dataKey="expenses" name="Gastos" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Gráfico de línea temporal */}
          <h3 className="text-lg font-semibold mt-6 mb-2">Evolución Temporal</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayName" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(2)}€`} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10B981" name="Ingresos" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Gastos" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Gráfico de donut de gastos por categoría */}
          <h3 className="text-lg font-semibold mt-6 mb-2">Distribución de Gastos por Categoría</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.expensesChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {metrics.expensesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value.toFixed(2)}€ (${((value/metrics.totalExpenses)*100).toFixed(1)}%)`, name]} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Gráfico de donut de ingresos por categoría */}
          <h3 className="text-lg font-semibold mt-6 mb-2">Distribución de Ingresos por Categoría</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.incomeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  fill="#10B981"
                  dataKey="amount"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {metrics.incomeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || "#10B981"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value.toFixed(2)}€ (${((value/metrics.totalIncome)*100).toFixed(1)}%)`, name]} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Pestaña de Configuración */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Gestionar Categorías</h2>
          
          {/* Crear nueva categoría */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Crear Nueva Categoría</h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de Categoría</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nombre de la categoría"
                    className="flex-1 px-3 py-2 border rounded"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded font-medium disabled:bg-blue-300"
                    onClick={addCategory}
                    disabled={!newCategory.trim()}
                  >
                    Crear
                  </button>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <label className="block text-sm font-medium mb-1">Añadir Subcategoría a Categoría</label>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nueva subcategoría"
                      className="flex-1 px-3 py-2 border rounded"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      disabled={!selectedCategory}
                    />
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
                      onClick={addSubcategoryToExisting}
                      disabled={!selectedCategory || !newSubcategory.trim()}
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Gestionar categorías existentes - Diseño mejorado */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Colores y Gestión de Categorías</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {categories.map(category => (
                <div key={category.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></span>
                    <span className="flex-1 font-semibold">{category.name}</span>
                    <input
                      type="color"
                      value={category.color}
                      onChange={(e) => updateCategoryColor(category.id, e.target.value)}
                      className="h-8 w-12 border-0"
                    />
                    <button 
                      className="text-red-500 px-2 py-1 rounded hover:bg-red-100"
                      onClick={() => confirmDelete('category', category.id, category.name)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Subcategorías */}
                  <div className="pl-6 space-y-1 mt-2 bg-white p-2 rounded">
                    {category.subcategories.map((sub, index) => (
                      <div key={index} className="flex items-center text-sm border-b pb-1">
                        <span className="flex-1">└ {sub}</span>
                        <button 
                          className="text-red-500 px-1 py-0.5 rounded hover:bg-red-100"
                          onClick={() => confirmDelete('subcategory', index, sub, category.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    {category.subcategories.length === 0 && (
                      <div className="text-sm text-gray-500 italic">Sin subcategorías</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Pestaña Año */}
      {activeTab !== 'analytics' && activeTab !== 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">
              Añadir Transacción para {yearTabs.find(tab => tab.id === activeTab)?.name || ''}
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm mb-1">Tipo</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                  >
                    <option value="expense">Gasto</option>
                    <option value="income">Ingreso</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-1">Cantidad (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Fecha</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Categoría</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({
                    ...newTransaction, 
                    category: e.target.value,
                    subcategory: ''
                  })}
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                  {newTransaction.type === 'income' && !categories.some(c => c.name === 'Ingresos') && (
                    <option value="Ingresos">Ingresos</option>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Subcategoría</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newTransaction.subcategory}
                  onChange={(e) => setNewTransaction({...newTransaction, subcategory: e.target.value})}
                  disabled={!newTransaction.category}
                >
                  <option value="">Seleccione una subcategoría</option>
                  {newTransaction.category && getSubcategories(newTransaction.category).map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                  {newTransaction.type === 'income' && newTransaction.category === 'Ingresos' && (
                    <>
                      <option value="Salario">Salario</option>
                      <option value="Otros">Otros</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Descripción</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  rows="2"
                ></textarea>
              </div>
              
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={addTransaction}
              >
                Guardar Transacción
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-2">
              Métricas de {yearTabs.find(tab => tab.id === activeTab)?.name || ''}
            </h2>
            
            {/* Filtro de fecha para pestaña de año */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Fecha Fin</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                />
              </div>
            </div>
            
            {/* Tarjetas de métricas */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <h3 className="text-sm text-gray-600">Ingresos</h3>
                <p className="text-xl font-bold text-green-600">{metrics.totalIncome.toFixed(2)}€</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg text-center">
                <h3 className="text-sm text-gray-600">Gastos</h3>
                <p className="text-xl font-bold text-red-600">{metrics.totalExpenses.toFixed(2)}€</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <h3 className="text-sm text-gray-600">Balance</h3>
                <p className={`text-xl font-bold ${metrics.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.balance.toFixed(2)}€
                </p>
              </div>
            </div>
            
            {/* Transacciones recientes - Con control de orden y opción de eliminar */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Transacciones Recientes</h3>
              <button 
                className="flex items-center text-sm bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200"
                onClick={() => setTransactionSort(transactionSort === 'desc' ? 'asc' : 'desc')}
              >
                <span>Orden: {transactionSort === 'desc' ? 'Más reciente primero' : 'Más antiguo primero'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ml-1 ${transactionSort === 'asc' ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto border rounded">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-3 text-left">Fecha</th>
                    <th className="py-2 px-3 text-left">Tipo</th>
                    <th className="py-2 px-3 text-left">Categoría</th>
                    <th className="py-2 px-3 text-right">Cantidad</th>
                    <th className="py-2 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-3">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="py-2 px-3">{t.type === 'expense' ? 'Gasto' : 'Ingreso'}</td>
                      <td className="py-2 px-3">
                        {t.category}{t.subcategory ? `/${t.subcategory}` : ''}
                      </td>
                      <td className={`py-2 px-3 font-semibold text-right ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)}€
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button 
                          className="text-red-500 hover:bg-red-100 p-1 rounded"
                          onClick={() => confirmDeleteTransaction(t.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-gray-500">
                        No hay transacciones para mostrar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Gráficos para el año específico */}
            {metrics.timelineData.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Evolución Temporal</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="displayName" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toFixed(2)}€`} />
                      <Legend />
                      <Bar dataKey="income" name="Ingresos" fill="#10B981" />
                      <Bar dataKey="expenses" name="Gastos" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modal para nueva pestaña */}
      {showNewTabModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Añadir Nueva Pestaña</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la Pestaña</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  placeholder="Ej: Año 2025, Proyecto Casa, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Año</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={newTabYear}
                  onChange={(e) => setNewTabYear(e.target.value)}
                  placeholder="Ej: 2025"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowNewTabModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
                onClick={addNewTab}
                disabled={!newTabName.trim() || !newTabYear.trim()}
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmar eliminación</h3>
            <p className="mb-6">
              {(() => {
                switch(deleteTarget.type) {
                  case 'category':
                    return `¿Estás seguro de que deseas eliminar la categoría "${deleteTarget.name}"? Todos los gastos asociados a esta categoría también serán eliminados.`;
                  case 'subcategory':
                    return `¿Estás seguro de que deseas eliminar la subcategoría "${deleteTarget.name}"? Las transacciones asociadas a esta subcategoría perderán su asignación.`;
                  case 'transaction':
                    return `¿Estás seguro de que deseas eliminar esta transacción (${deleteTarget.name})?`;
                  case 'tab':
                    return `¿Estás seguro de que deseas eliminar la pestaña "${deleteTarget.name}"?`;
                  default:
                    return '¿Estás seguro de que deseas eliminar este elemento?';
                }
              })()}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={cancelDelete}
              >
                Cancelar
              </button>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => {
                  switch(deleteTarget.type) {
                    case 'category':
                      deleteCategory(deleteTarget.id);
                      break;
                    case 'subcategory':
                      deleteSubcategory(deleteTarget.categoryId, deleteTarget.id);
                      break;
                    case 'transaction':
                      deleteTransaction(deleteTarget.id);
                      break;
                    case 'tab':
                      deleteTab(deleteTarget.id);
                      break;
                    default:
                      cancelDelete();
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;