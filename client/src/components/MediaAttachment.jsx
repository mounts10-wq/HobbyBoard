function getYouTubeEmbedUrl(inputUrl) {
  try {
    const parsed = new URL(inputUrl);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const watchId = parsed.searchParams.get("v");
      if (watchId) {
        return `https://www.youtube.com/embed/${watchId}`;
      }

      const pathParts = parsed.pathname.split("/").filter(Boolean);
      if (pathParts[0] === "shorts" && pathParts[1]) {
        return `https://www.youtube.com/embed/${pathParts[1]}`;
      }

      if (pathParts[0] === "embed" && pathParts[1]) {
        return `https://www.youtube.com/embed/${pathParts[1]}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function detectMediaType(url) {
  const normalized = String(url || "").trim();

  if (!normalized) {
    return { type: "none" };
  }

  const imagePattern = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;
  const videoPattern = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

  const youtubeEmbedUrl = getYouTubeEmbedUrl(normalized);
  if (youtubeEmbedUrl) {
    return { type: "youtube", embedUrl: youtubeEmbedUrl, url: normalized };
  }

  if (imagePattern.test(normalized)) {
    return { type: "image", url: normalized };
  }

  if (videoPattern.test(normalized)) {
    return { type: "video", url: normalized };
  }

  return { type: "link", url: normalized };
}

function MediaAttachment({ url }) {
  const media = detectMediaType(url);

  if (media.type === "none") {
    return null;
  }

  return (
    <div className="media-attachment">
      {media.type === "image" && (
        <img
          className="media-preview"
          src={media.url}
          alt="Project media attachment"
          loading="lazy"
        />
      )}

      {media.type === "video" && (
        <video className="media-preview" controls preload="metadata">
          <source src={media.url} />
          Your browser does not support embedded video playback.
        </video>
      )}

      {media.type === "youtube" && (
        <iframe
          className="media-preview media-preview-embed"
          src={media.embedUrl}
          title="Project media video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}

      <p className="community-media-link">
        Media: <a href={media.url} target="_blank" rel="noreferrer">{media.url}</a>
      </p>
    </div>
  );
}

export default MediaAttachment;
