import React, { useState } from 'react';
import Icon from './Icon';
import { getDisplayName } from '../utils';

function Comment({ comment, postId, onReply }) {
  const [liked, setLiked] = useState(false);
  const displayName = comment.official ? '官方小助手' : getDisplayName(comment.userId, postId);
  return (
    <article className={`comment ${comment.official ? 'official' : ''} flex gap-[12px]`}>
      <div className="anon-avatar small grid w-[34px] h-[34px] flex-none place-items-center border border-line rounded-[8px] bg-surface-soft text-text-3">
        <Icon name={comment.official ? 'verified_user' : 'person'} />
      </div>
      <div className="comment-body flex-1 p-4 rounded-md border border-line-soft bg-surface">
        <div className="comment-meta flex items-center gap-[8px]">
          <strong>{displayName}</strong>
          <span className="comment-id text-xs font-semibold text-text-3">#{comment.id}</span>
          {comment.official && <span className="pill blue text-[10px] px-[2px_6px]">官方</span>}
        </div>
        <p className="my-[9px]">{comment.content}</p>
        <div className="comment-actions flex gap-[14px] text-text-3 text-xs font-semibold">
          <span>{comment.time}</span>
          <button type="button" onClick={onReply}>回复</button>
          <button type="button" onClick={() => setLiked(!liked)}>
            <Icon name="thumb_up" /> {liked ? comment.likes + 1 : comment.likes}
          </button>
        </div>
        {comment.replies.length > 0 && (
          <div className="reply-list mt-[14px] pl-[14px] border-l-2 border-line">
            {comment.replies.map((reply) => {
              const replyName = getDisplayName(reply.userId, postId);
              return (
                <div className="reply mb-3 last:mb-0" key={reply.id}>
                  <strong>{replyName} <span className="comment-id text-xs font-semibold text-text-3">#{reply.id}</span></strong>
                  <p className="my-[6px]">{reply.content}</p>
                  <span className="text-[13px] text-text-2">{reply.time} · {reply.likes} 赞</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

export default Comment;