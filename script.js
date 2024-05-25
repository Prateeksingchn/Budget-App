document.addEventListener("DOMContentLoaded", function () {
  const totalAmount = document.getElementById("total-amount");
  const userAmount = document.getElementById("user-amount");
  const checkAmountButton = document.getElementById("check-amount");
  const totalAmountButton = document.getElementById("total-amount-button");
  const productTitle = document.getElementById("product-title");
  const budgetError = document.getElementById("budget-error");
  const productTitleError = document.getElementById("product-title-error");
  const amountOutput = document.getElementById("amount");
  const expenditureOutput = document.getElementById("expenditure-value");
  const balanceOutput = document.getElementById("balance-amount");
  const expenseList = document.getElementById("list");
  const category = document.getElementById("category");
  const expenseDate = document.getElementById("expense-date");
  const budgetPeriod = document.getElementById("budget-period");
  const sortButton = document.getElementById("sort-button");
  const filterButton = document.getElementById("filter-button");
  const loadMoreButton = document.getElementById("load-more-button");
  const pieChartButton = document.getElementById("pie-chart-button");
  const barChartButton = document.getElementById("bar-chart-button");
  const chartContainer = document.getElementById("chart-container");

  let tempAmount = 0;
  let budgetInterval = 30; // Default to monthly
  let expenses = [];
  let expensesPerPage = 10;
  let currentPage = 1;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  const setPeriod = () => {
    const selectedPeriod = budgetPeriod.value;
    switch (selectedPeriod) {
      case "monthly":
        budgetInterval = 30;
        break;
      case "quarterly":
        budgetInterval = 90;
        break;
      case "annually":
        budgetInterval = 365;
        break;
      default:
        budgetInterval = 30;
    }
  };

  const setBudget = () => {
    tempAmount = parseFloat(totalAmount.value);
    if (isNaN(tempAmount) || tempAmount <= 0) {
      budgetError.classList.remove("hidden");
    } else {
      budgetError.classList.add("hidden");
      amountOutput.innerHTML = tempAmount.toFixed(2);
      balanceOutput.innerHTML = (
        tempAmount - parseFloat(expenditureOutput.innerHTML)
      ).toFixed(2);
      localStorage.setItem(
        "budget",
        JSON.stringify({
          total: tempAmount,
          period: budgetInterval,
        })
      );
    }
    totalAmount.value = "";
  };

  const updateLocalStorage = () => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  };

  const calculateTotalExpense = () => {
    const totalExpense = expenses.reduce(
      (acc, expense) => acc + parseFloat(expense.amount),
      0
    );
    expenditureOutput.innerHTML = totalExpense.toFixed(2);
    balanceOutput.innerHTML = (tempAmount - totalExpense).toFixed(2);
  };

  const deleteExpense = (index) => {
    expenses.splice(index, 1);
    updateLocalStorage();
    loadExpenses();
    calculateTotalExpense();
  };

  const editExpense = (index) => {
    const expense = expenses[index];
    productTitle.value = expense.title;
    userAmount.value = expense.amount;
    category.value = expense.category;
    expenseDate.value = expense.date;
    deleteExpense(index);
  };

  const loadExpenses = () => {
    expenseList.innerHTML = "";
    const startIndex = (currentPage - 1) * expensesPerPage;
    const endIndex = startIndex + expensesPerPage;
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses.slice(startIndex, endIndex).forEach((expense, index) => {
      const listItem = document.createElement("div");
      listItem.classList.add(
        "sublist-content",
        "text-gray-900",
        "bg-blue-500",
        "rounded-md",
        "p-4"
      );
      listItem.innerHTML = `
        <span class="product">${expense.title}</span>
        <span class="amount">${expense.amount}</span>
        <span class="category">${expense.category}</span>
        <span class="date">${formatDate(expense.date)}</span>
        <div class="icons-container flex">
          <button class="edit" data-index="${startIndex + index}"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="delete" data-index="${startIndex + index}"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      `;
      expenseList.appendChild(listItem);
    });
    calculateTotalExpense();
    loadMoreButton.disabled = endIndex >= expenses.length;
  };

  const addExpense = () => {
    const expense = {
      title: productTitle.value,
      amount: userAmount.value,
      category: category.value,
      date: expenseDate.value,
    };
    if (!expense.title || !expense.amount || parseFloat(expense.amount) <= 0) {
      productTitleError.classList.remove("hidden");
      return;
    }
    productTitleError.classList.add("hidden");
    expenses.push(expense);
    updateLocalStorage();
    loadExpenses();
    calculateTotalExpense();
    productTitle.value = "";
    userAmount.value = "";
    category.value = "general";
    expenseDate.value = "";
  };

  const initializeApp = () => {
    const savedBudget = JSON.parse(localStorage.getItem("budget"));
    if (savedBudget) {
      tempAmount = savedBudget.total;
      budgetInterval = savedBudget.period;
      amountOutput.innerHTML = tempAmount.toFixed(2);
      balanceOutput.innerHTML = (
        tempAmount - parseFloat(expenditureOutput.innerHTML)
      ).toFixed(2);
    }
    loadExpenses();
  };

  const sortExpenses = () => {
    // Implement sorting logic here
  };

  const filterExpenses = () => {
    // Implement filtering logic here
  };

  const loadMoreExpenses = () => {
    currentPage++;
    loadExpenses();
  };

  const renderPieChart = () => {
    const categoryExpenses = expenses.reduce((acc, expense) => {
      if (acc[expense.category]) {
        acc[expense.category] += parseFloat(expense.amount);
      } else {
        acc[expense.category] = parseFloat(expense.amount);
      }
      return acc;
    }, {});

    const chartData = {
      labels: Object.keys(categoryExpenses),
      datasets: [
        {
          data: Object.values(categoryExpenses),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#9966FF",
            "#4BC0C0",
            "#FF9F40",
            "#8E5EA2",
          ],
        },
      ],
    };

    const ctx = document.createElement("canvas");
    chartContainer.innerHTML = "";
    chartContainer.appendChild(ctx);

    new Chart(ctx, {
      type: "pie",
      data: chartData,
    });
  };

  const renderBarChart = () => {
    const categoryExpenses = expenses.reduce((acc, expense) => {
      if (acc[expense.category]) {
        acc[expense.category] += parseFloat(expense.amount);
      } else {
        acc[expense.category] = parseFloat(expense.amount);
      }
      return acc;
    }, {});
  
    const chartData = {
      labels: Object.keys(categoryExpenses),
      datasets: [
        {
          label: "Expenses",
          data: Object.values(categoryExpenses),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#9966FF",
            "#4BC0C0",
            "#FF9F40",
            "#8E5EA2",
          ],
        },
      ],
    };
  
    const ctx = document.createElement("canvas");
    chartContainer.innerHTML = "";
    chartContainer.appendChild(ctx);
  
    new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  };
  
  initializeApp();
  
  totalAmountButton.addEventListener("click", () => {
    setPeriod();
    setBudget();
  });
  
  checkAmountButton.addEventListener("click", addExpense);
  sortButton.addEventListener("click", sortExpenses);
  filterButton.addEventListener("click", filterExpenses);
  loadMoreButton.addEventListener("click", loadMoreExpenses);
  pieChartButton.addEventListener("click", renderPieChart);
  barChartButton.addEventListener("click", renderBarChart);
  
  expenseList.addEventListener("click", (e) => {
    if (e.target.closest(".edit")) {
      const index = e.target.closest(".edit").dataset.index;
      editExpense(index);
    } else if (e.target.closest(".delete")) {
      const index = e.target.closest(".delete").dataset.index;
      deleteExpense(index);
    }
  });
  });