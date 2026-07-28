import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";
import BoardForm from "../components/BoardForm";
import BoardCard from "../components/BoardCard";

function Dashboard() {
  const { user } = useAuth();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    board_count: 0,
    task_count: 0,
    completed_tasks: 0,
    in_progress_tasks: 0,
    not_started_tasks: 0,
    high_priority_tasks: 0,
    completion_rate: 0,
  });

  useEffect(() => {
    fetchBoards();
    fetchStats();
  }, []);

  async function fetchBoards() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/boards?page=1&per_page=10");
      setBoards(data.boards);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    setStatsLoading(true);

    try {
      const data = await apiRequest("/dashboard/stats");
      setStats(data.stats);
    } catch (err) {
      setStats({
        board_count: 0,
        task_count: 0,
        completed_tasks: 0,
        in_progress_tasks: 0,
        not_started_tasks: 0,
        high_priority_tasks: 0,
        completion_rate: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  }
   
   async function handleUpdateBoard(boardId, updates) {
     const data = await apiRequest(`/boards/${boardId}`, {
       method: "PATCH",
       body: JSON.stringify(updates),
    });

    setBoards(
       boards.map((board) => (board.id === boardId ? data.board : board))
    );
   }
  async function handleCreateBoard(formData) {
    const data = await apiRequest("/boards", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    setBoards([data.board, ...boards]);
    fetchStats();
  }

  async function handleDeleteBoard(boardId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this board?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await apiRequest(`/boards/${boardId}`, {
        method: "DELETE",
      });

      setBoards(boards.filter((board) => board.id !== boardId));
      fetchStats();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="dashboard-header">
        <div>
          <h1>Your Project Boards</h1>
          <p>Welcome, {user?.username}. Create boards to organize your projects.</p>
        </div>
      </div>

      <section className="insights-panel">
        <div className="insights-header">
          <h2>Progress Snapshot</h2>
          {!statsLoading && (
            <span className="count-pill">{stats.completion_rate}% complete</span>
          )}
        </div>

        {statsLoading ? (
          <p className="loading-message">Loading your stats...</p>
        ) : (
          <>
            <div className="progress-track" role="img" aria-label="Task completion progress">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(stats.completion_rate, 100)}%` }}
              />
            </div>

            <div className="stats-grid">
              <article className="stat-card">
                <p className="stat-label">Boards</p>
                <p className="stat-value">{stats.board_count}</p>
              </article>
              <article className="stat-card">
                <p className="stat-label">Total Tasks</p>
                <p className="stat-value">{stats.task_count}</p>
              </article>
              <article className="stat-card">
                <p className="stat-label">Completed</p>
                <p className="stat-value">{stats.completed_tasks}</p>
              </article>
              <article className="stat-card">
                <p className="stat-label">In Progress</p>
                <p className="stat-value">{stats.in_progress_tasks}</p>
              </article>
              <article className="stat-card">
                <p className="stat-label">Not Started</p>
                <p className="stat-value">{stats.not_started_tasks}</p>
              </article>
              <article className="stat-card">
                <p className="stat-label">High Priority</p>
                <p className="stat-value">{stats.high_priority_tasks}</p>
              </article>
            </div>
          </>
        )}
      </section>

      <BoardForm onCreateBoard={handleCreateBoard} />

      {loading && <p className="loading-message">Loading boards...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && boards.length === 0 && (
        <p className="empty-state">You do not have any boards yet. Create your first one above.</p>
      )}

      <div className="board-grid">
        {boards.map((board) => (
          <BoardCard
            key={board.id}
            board={board}
            onDeleteBoard={handleDeleteBoard}
            onUpdateBoard={handleUpdateBoard}
          />
        ))}
      </div>
    </section>
  );
}

export default Dashboard;