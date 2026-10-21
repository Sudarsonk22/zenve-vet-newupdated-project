import { useState } from 'react';

export default function StoryAvatar({ src, name }) {
  const [broken, setBroken] = useState(false);
  const letter = (name || '?').replace(/^dr\.?\s*/i, '').charAt(0).toUpperCase();

  if (!src || broken) {
    return <span className="st-letter">{letter}</span>;
  }
  return <img src={src} alt="" onError={() => setBroken(true)} />;
}