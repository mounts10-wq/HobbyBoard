import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import BoardUpdates from "../components/BoardUpdates";

function BoardDetails() {
  const { boardId } = useParams();

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  async function fetchBoard() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(`/boards/${boardId}`);
      setBoard(data.board);
      setTasks(data.board.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(formData) {
    const data = await apiRequest(`/boards/${boardId}/tasks`, {
      method: "POST",
      body: JSON.stringify(formData),
    });

    setTasks([data.task, ...tasks]);
  }

  async function handleUpdateTask(taskId, updates) {
    try {
      const data = await apiRequest(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      setTasks(
        tasks.map((task) => (task.id === taskId ? data.task : task))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteTask(taskId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: "DELETE",
      });

      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p className="loading-message">Loading board...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!board) {
    return <p className="empty-state">Board not found.</p>;
  }

  return (
    <section>
      <Link to="/dashboard" className="back-link">
        ← Back to Dashboard
      </Link>

      <div className="board-detail-header">
        <h1>{board.title}</h1>
        <p className="board-type">{board.hobby_type}</p>
        <p>{board.description || "No description added yet."}</p>
      </div>

      <BoardUpdates boardId={boardId} />

      <TaskForm onCreateTask={handleCreateTask} />

      <div className="task-section">
        <div className="task-section-header">
          <h2>Tasks</h2>
          <span className="count-pill">{tasks.length} total</span>
        </div>

        {tasks.length === 0 ? (
          <p className="empty-state">No tasks yet. Add your first task above.</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default BoardDetails;