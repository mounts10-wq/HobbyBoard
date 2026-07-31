import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";
import MediaAttachment from "../components/MediaAttachment";

function Community() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("feed");
  const [feedUpdates, setFeedUpdates] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [discoverBoards, setDiscoverBoards] = useState([]);
  const [followingBoards, setFollowingBoards] = useState([]);
  const [followingBoardsLoading, setFollowingBoardsLoading] = useState(true);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState("");
  const [query, setQuery] = useState("");
  const [hobby, setHobby] = useState("");
  const [followingUserIds, setFollowingUserIds] = useState(new Set());
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetchFollowingUsers();
    fetchFeed();
    fetchFollowingBoards();
    fetchDiscoverBoards();
  }, []);

  async function fetchFollowingBoards() {
    setFollowingBoardsLoading(true);

    try {
      const data = await apiRequest("/me/following/boards");
      setFollowingBoards(data.boards || []);
    } catch {
      setFollowingBoards([]);
    } finally {
      setFollowingBoardsLoading(false);
    }
  }

  async function fetchFollowingUsers() {
    try {
      const data = await apiRequest("/me/following");
      setFollowingUserIds(new Set(data.following_user_ids || []));
    } catch {
      setFollowingUserIds(new Set());
    }
  }

  async function fetchFeed() {
    setFeedLoading(true);
    setFeedError("");

    try {
      const data = await apiRequest("/feed");
      setFeedUpdates(data.updates || []);
    } catch (error) {
      setFeedError(error.message);
    } finally {
      setFeedLoading(false);
    }
  }

  async function fetchDiscoverBoards(overrides = {}) {
    setDiscoverLoading(true);
    setDiscoverError("");

    const qValue = (overrides.query ?? query).trim();
    const hobbyValue = (overrides.hobby ?? hobby).trim();

    const params = new URLSearchParams();
    if (qValue) {
      params.set("q", qValue);
    }
    if (hobbyValue) {
      params.set("hobby", hobbyValue);
    }

    const endpoint = params.toString()
      ? `/discover/boards?${params.toString()}`
      : "/discover/boards";

    try {
      const data = await apiRequest(endpoint);
      setDiscoverBoards(data.boards || []);
    } catch (error) {
      setDiscoverError(error.message);
    } finally {
      setDiscoverLoading(false);
    }
  }

  async function handleFollow(targetUserId) {
    setNotice("");

    try {
      await apiRequest(`/users/${targetUserId}/follow`, { method: "POST" });
      setFollowingUserIds((current) => new Set([...current, targetUserId]));
      setNotice("Following user.");
      fetchFeed();
      fetchFollowingBoards();
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function handleUnfollow(targetUserId) {
    setNotice("");

    try {
      await apiRequest(`/users/${targetUserId}/follow`, { method: "DELETE" });
      setFollowingUserIds((current) => {
        const next = new Set(current);
        next.delete(targetUserId);
        return next;
      });
      setNotice("Unfollowed user.");
      fetchFeed();
      fetchFollowingBoards();
    } catch (error) {
      setNotice(error.message);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    fetchDiscoverBoards();
  }

  const feedView = useMemo(() => {
    if (feedLoading) {
      return <p className="loading-message">Loading community feed...</p>;
    }

    if (feedError) {
      return <p className="error-message">{feedError}</p>;
    }

    if (!feedUpdates.length) {
      return (
        <p className="empty-state">
          Your community feed is empty. Follow people or publish public boards to see activity here.
        </p>
      );
    }

    return (
      <div className="community-list">
        {feedUpdates.map((update) => {
          const isSelf = update.user_id === user?.id;
          const isFollowing = followingUserIds.has(update.user_id);

          return (
            <article className="community-card" key={`feed-${update.id}`}>
              <div className="community-card-header">
                <div>
                  <p className="update-author">{update.username || "Community member"}</p>
                  <p className="update-meta">
                    {update.hobby_type || "Hobby"} • {update.board_title || "Project"}
                  </p>
                </div>

                {!isSelf && (
                  <button
                    type="button"
                    className={isFollowing ? "cancel-button" : "secondary-button"}
                    onClick={() => (isFollowing ? handleUnfollow(update.user_id) : handleFollow(update.user_id))}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>

              <p className="update-content">{update.content}</p>

              {update.media_url && <MediaAttachment url={update.media_url} />}

              {update.board_id && (
                <div className="community-card-actions">
                  <Link to={`/boards/${update.board_id}`} className="view-button">
                    Open board
                  </Link>
                </div>
              )}
            </article>
          );
        })}
      </div>
    );
  }, [feedLoading, feedError, feedUpdates, followingUserIds, user?.id]);

  return (
    <section>
      <div className="community-header">
        <h1>Community</h1>
        <p>Discover public projects, follow builders, and learn from real updates.</p>
      </div>

      <div className="community-tabs" role="tablist" aria-label="Community views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "feed"}
          className={activeTab === "feed" ? "community-tab active" : "community-tab"}
          onClick={() => setActiveTab("feed")}
        >
          Feed
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "discover"}
          className={activeTab === "discover" ? "community-tab active" : "community-tab"}
          onClick={() => setActiveTab("discover")}
        >
          Discover Boards
        </button>
      </div>

      {notice && <p className="success-message">{notice}</p>}

      <section className="followed-boards-panel">
        <div className="task-section-header">
          <h2>Following Boards</h2>
          <span className="count-pill">Quick access</span>
        </div>

        {followingBoardsLoading ? (
          <p className="loading-message">Loading followed boards...</p>
        ) : followingBoards.length === 0 ? (
          <p className="empty-state">Follow users to see their public boards here for quick access.</p>
        ) : (
          <div className="followed-board-chips">
            {followingBoards.map((board) => (
              <Link key={`followed-${board.id}`} to={`/boards/${board.id}`} className="followed-board-chip">
                {board.title}
                <span>{board.owner_username || "Community member"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {activeTab === "feed" ? (
        feedView
      ) : (
        <section className="discover-panel">
          <form className="discover-form" onSubmit={handleSearch}>
            <label>
              Search text
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try: guitar, 3D print, model train"
              />
            </label>
            <label>
              Hobby type
              <input
                type="text"
                value={hobby}
                onChange={(event) => setHobby(event.target.value)}
                placeholder="Try: Woodworking"
              />
            </label>

            <button type="submit" className="secondary-button" disabled={discoverLoading}>
              {discoverLoading ? "Searching..." : "Search"}
            </button>
          </form>

          {discoverError && <p className="error-message">{discoverError}</p>}

          {!discoverLoading && !discoverError && discoverBoards.length === 0 ? (
            <p className="empty-state">No public boards found yet. Try broadening your search terms.</p>
          ) : (
            <div className="community-list">
              {discoverBoards.map((board) => (
                <article className="community-card" key={`discover-${board.id}`}>
                  <div className="community-card-header">
                    <div>
                      <h3>{board.title}</h3>
                      <p className="update-meta">
                        {board.hobby_type} • by {board.owner_username || "Community member"}
                      </p>
                    </div>
                    <div className="community-card-actions">
                      {board.user_id !== user?.id && (
                        followingUserIds.has(board.user_id) ? (
                          <button
                            type="button"
                            className="cancel-button"
                            onClick={() => handleUnfollow(board.user_id)}
                          >
                            Following
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => handleFollow(board.user_id)}
                          >
                            Follow
                          </button>
                        )
                      )}
                      <Link to={`/boards/${board.id}`} className="view-button">
                        Open
                      </Link>
                    </div>
                  </div>

                  <p>{board.description || "No description shared yet."}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}

export default Community;
