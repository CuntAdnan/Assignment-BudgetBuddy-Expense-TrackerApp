import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom"; // Import Navigate from react-router-dom
import { proxy } from "../../utils/proxy.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import moment from "moment-timezone";
import Sidebar from "../components/Sidebar.jsx";
import Transaction from "../components/Transaction.jsx";
import Navbar2 from "../components/Navbar2.jsx";
import graph from "../assets/graph.png";
import Tcard2 from "../components/Tcard2.jsx";
import "../styles/Home.css";
import { FaCircle, FaBalanceScaleLeft } from "react-icons/fa";
import { BiSolidUpArrowCircle, BiSolidDownArrowCircle } from "react-icons/bi";
import { TbCashBanknoteOff } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import { Bar } from "react-chartjs-2"; // Import Bar from react-chartjs-2

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Recents = (props) => {
  const { transactions, numFunc } = props;

  if (transactions.length === 0) {
    return (
      <div className="recent-details">
        <h2 className="recent-1">Recent Transactions</h2>
        <p className="empty">
          Wow, Such empty.
          <br />
          <br />
          <div className="notes-strike-icon">
            <TbCashBanknoteOff />
          </div>
          <br />
          Add a new income/expense
          <br />
          in new-entry page 😁
        </p>
      </div>
    );
  }

  const recentTransactions = transactions.slice(-5).reverse();

  const handleViewAll = () => {
    numFunc(2);
  };

  return (
    <div className="recent-details">
      <div className="recent-container">
        <h2 className="recent-1">Recent Transactions</h2>
        <button className="view-all" onClick={handleViewAll}>
          View all
        </button>
      </div>
      {recentTransactions.map((transaction) => {
        const istDateTime = moment(transaction.date)
          .tz("Asia/Kolkata")
          .format("MMMM DD, YYYY h:mmA");

        return (
          <Transaction
            key={transaction._id}
            title={transaction.title}
            amount={transaction.amount}
            time={istDateTime}
            type={transaction.type}
          />
        );
      })}
    </div>
  );
};

const Dashboard = (props) => {
  const { transactions, username } = props;

  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  const recentTransactions = transactions.slice(-7);
  recentTransactions.forEach((transaction) => {
    transaction.date = moment(transaction.date)
      .tz("Asia/Kolkata")
      .format("MMM DD, YYYY");
  });

  const expense = recentTransactions.filter(
    (transaction) => transaction.type === "expense"
  );

  const income = recentTransactions.filter(
    (transaction) => transaction.type === "income"
  );

  const combinedData = recentTransactions
    .map((transaction) => {
      const { date } = transaction;
      const incomeAmount =
        income.find((item) => item.date === transaction.date)?.amount || 0;
      const expenseAmount =
        expense.find((item) => item.date === transaction.date)?.amount || 0;

      return {
        date,
        incomeAmount,
        expenseAmount,
      };
    })
    .filter((data, index, combinedData) => {
      return index === combinedData.findIndex((t) => t.date === data.date);
    });

  const data = {
    labels: combinedData.map((data) => data.date),
    datasets: [
      {
        label: "Income",
        data: combinedData.map((data) => data.incomeAmount),
        backgroundColor: "rgba(0, 255, 0, 0.5)",
      },
      {
        label: "Expense",
        data: combinedData.map((data) => data.expenseAmount),
        backgroundColor: "rgba(255, 0, 0, 0.5)",
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += `₹ ${context.parsed.y}`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount",
        },
      },
    },
  };

  return (
    <div className="content-text">
      <div className="welcome-message">
        <h1 className="welcome">
          Hey,&nbsp;
          <span style={{ color: "#6748d6" }}>{username}</span> 😁
        </h1>
        <p className="overview">Here's your overview</p>
      </div>

      <div className="graph">
        <Bar data={data} options={options} width={700} height={300} />
      </div>
    </div>
  );
};

const Transactions = (props) => {
  const transactions = props.transactions.slice().reverse();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionsState, setTransactions] = useState(transactions);

  const handleRowClick = (transactionId) => {
    setSelectedTransaction(transactionId);
  };

  const handleDelete = async (id) => {
    console.log("delete");

    try {
      const response = await fetch(`${proxy}/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Transaction deleted successfully");
        const updatedTransactions = transactionsState.filter(
          (transaction) => transaction._id !== id
        );
        setTransactions(updatedTransactions);
      } else {
        console.error("Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <div>
      <h2 className="transaction-h2">Transactions</h2>
      <div className="table">
        <div className="table-row header">
          <div className="table-cell first">Title</div>
          <div className="table-cell">Amount</div>
          <div className="table-cell">Date</div>
          <div className="table-cell last">Category</div>
        </div>

        {transactions.map((transaction) => {
          return (
            <div
              className="table-row"
              key={transaction._id}
              onClick={() => handleRowClick(transaction._id)}
            >
              <div className="table-cell first">{transaction.title}</div>
              <div className="table-cell">
                <span>
                  <FaCircle
                    className={`circle ${
                      transaction.type === "income"
                        ? "green-circle"
                        : "red-circle"
                    }`}
                  />
                </span>
                {transaction.amount}
              </div>
              <div className="table-cell">
                {moment(transaction.date).format("DD-MM-YYYY")}
              </div>
              <div className="table-cell last">{transaction.category}</div>
              <div className="delete">
                <MdDelete onClick={() => handleDelete(transaction._id)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Totals = (props) => {
  const transactions = props.transactions;

  const expense = transactions.filter(
    (transaction) => transaction.type === "expense"
  );
  const totalExpense = expense.reduce((sum, transaction) => sum + transaction.amount, 0);

  const income = transactions.filter(
    (transaction) => transaction.type === "income"
  );
  const totalIncome = income.reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div>
      <div className="totals-container">
        <div className="balance totals">
          <div className="flex-container-totals">
            <h3>Total Balance</h3>
            <h1>₹ {balance}</h1>
          </div>
          <FaBalanceScaleLeft className="totals-icons" />
        </div>
        <div className="income totals">
          <div className="flex-container-totals">
            <h3>Total Income</h3>
            <h1>₹ {totalIncome}</h1>
          </div>
          <BiSolidUpArrowCircle className="totals-icons" />
        </div>
        <div className="expense totals">
          <div className="flex-container-totals">
            <h3>Total Expense</h3>
            <h1>₹ {totalExpense}</h1>
          </div>
          <BiSolidDownArrowCircle className="totals-icons" />
        </div>
      </div>
    </div>
  );
};

const Home = (props) => {
  const [username, setUsername] = useState("");

  const userId = localStorage.getItem("userId");
  const transactions = props.transactions;

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Navbar code
  const [selectedNumber, setSelectedNumber] = useState(1);
  const handleNavbarSelectedItem = (number) => {
    setSelectedNumber(number);
  };

  return (
    <>
      {localStorage.getItem("username") ? (
        <div className="container-1">
          <div className="sidebar">
            <Sidebar />
          </div>
          <div className="content">
            <Navbar2
              className="navbar-home"
              n1="Dashboard"
              n2="All-Transactions"
              n3="Totals"
              onSelected={handleNavbarSelectedItem}
            />
            <div className="main-content">
              <div className="overview-container">
                {selectedNumber === 1 ? (
                  <>
                    <Dashboard
                      username={username}
                      transactions={transactions}
                    />
                    <Recents
                      transactions={transactions}
                      numFunc={setSelectedNumber}
                    />
                  </>
                ) : selectedNumber === 2 ? (
                  <Transactions transactions={transactions} />
                ) : (
                  <>
                    <Totals transactions={transactions} />
                    <Recents
                      transactions={transactions}
                      numFunc={setSelectedNumber}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Navigate to="/" replace />
      )}
    </>
  );
};

export default Home;
