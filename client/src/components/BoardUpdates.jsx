import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function BoardUpdates({ boardId }) {
  const [updates, setUpdates] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUpdates();
  }, [boardId]);

  async function fetchUpdates() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(`/boards/${boardId}/updates`);
      setUpdates(data.updates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!content.trim()) {
      setError("Update content is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const data = await apiRequest(`/boards/${boardId}/updates`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      setUpdates([data.update, ...updates]);
      setContent("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(updateId) {
    const confirmDelete = window.confirm("Delete this project update?");

    if (!confirmDelete) {
      return;
    }

    try {
      await apiRequest(`/updates/${updateId}`, {
        method: "DELETE",
      });

      setUpdates(updates.filter((update) => update.id !== updateId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="update-section">
      <div className="task-section-header">
        <h2>Project Updates</h2>
        <span className="count-pill">Share progress</span>
      </div>

      <form className="update-form" onSubmit={handleSubmit}>
        <label>
          Quick update
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Finished the frame, tested the first prototype, ordered supplies..."
          />
        </label>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="secondary-button" disabled={submitting}>
          {submitting ? "Posting..." : "Post Update"}
        </button>
      </form>

      {loading ? (
        <p className="loading-message">Loading updates...</p>
      ) : updates.length === 0 ? (
        <p className="empty-state">No updates yet. Share the first milestone for this board.</p>
      ) : (
        <div className="update-list">
          {updates.map((update) => (
            <article className="update-card" key={update.id}>
              <div className="update-card-header">
                <div>
                  <p className="update-author">{update.username || "You"}</p>
                  <p className="update-meta">
                    {new Date(update.created_at).toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDelete(update.id)}
                >
                  Delete
                </button>
              </div>

              <p className="update-content">{update.content}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default BoardUpdates;