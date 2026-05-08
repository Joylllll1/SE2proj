import React from 'react';

const Icon = ({ name, filled = false }) => {
  const paths = {
    dynamic_feed: 'M4 5.5h16M4 12h10M4 18.5h13',
    campaign: 'M5 13h3l8 4V7l-8 4H5v2Zm3 0v5',
    bookmark: 'M7 5h10v15l-5-3-5 3V5Z',
    edit_square: 'M5 19h14M7 15.5 16.5 6 18 7.5 8.5 17H7v-1.5Z',
    admin_panel_settings: 'M12 3 19 6v5c0 4-2.8 7.4-7 9-4.2-1.6-7-5-7-9V6l7-3Zm0 5v5l3 2',
    park: 'M12 3 6 10h4l-3 5h4v5h2v-5h4l-3-5h4l-6-7Z',
    search: 'M10.5 18a7.5 7.5 0 1 1 5.3-12.8A7.5 7.5 0 0 1 10.5 18Zm5.2-2.3 4.3 4.3',
    auto_awesome: 'M12 3l1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8L12 3ZM5 14l.7 2.3L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.7L5 14Zm14-1 .8 2.7L22 17l-2.2 1.3L19 21l-.8-2.7L16 17l2.2-1.3L19 13Z',
    notifications: 'M18 16H6l1.5-2V10a4.5 4.5 0 0 1 9 0v4L18 16ZM10 19h4',
    person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
    favorite: 'M12 20s-7-4.4-8.5-9.2C2.5 7.6 4.4 5 7.2 5c1.7 0 3.1.9 4 2.1.7-1.2 2.2-2.1 3.9-2.1 2.8 0 4.7 2.6 3.7 5.8C17.3 15.6 12 20 12 20Z',
    favorite_border: 'M12 20s-7-4.4-8.5-9.2C2.5 7.6 4.4 5 7.2 5c1.7 0 3.1.9 4 2.1.7-1.2 2.2-2.1 3.9-2.1 2.8 0 4.7 2.6 3.7 5.8C17.3 15.6 12 20 12 20Z',
    chat_bubble: 'M5 6h14v9H9l-4 4V6Z',
    smart_toy: 'M8 9h8a3 3 0 0 1 3 3v5H5v-5a3 3 0 0 1 3-3Zm4 0V5m-4 8h.1m7.9 0h.1M9 17h6',
    local_fire_department: 'M12 21c-3.5-1.6-5-3.7-5-6.5 0-2.5 1.5-4.2 3.2-5.9.9-.9 1.6-2 1.8-3.6 2.8 1.7 5 4.4 5 8 0 3.5-1.9 6.2-5 8Z',
    verified_user: 'M12 3 19 6v5c0 4-2.8 7.4-7 9-4.2-1.6-7-5-7-9V6l7-3Zm-3 9 2 2 4-5',
    thumb_up: 'M8 11v9H4v-9h4Zm0 0 4-7c1.3 0 2 1 1.5 2.5L13 9h5a2 2 0 0 1 2 2l-1.2 7a2 2 0 0 1-2 2H8',
    image: 'M4 6h16v12H4V6Zm3 9 3-3 2 2 3-4 3 5',
    sentiment_satisfied: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 10h.1m6.8 0h.1M8 14c1 1.4 2.3 2 4 2s3-.6 4-2',
    sentiment_very_satisfied: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 10h.1m7.9 0h.1M8 14h8c-.8 2-2.1 3-4 3s-3.2-1-4-3Z',
    sentiment_neutral: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 10h.1m6.8 0h.1M8 15h8',
    sentiment_dissatisfied: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 10h.1m6.8 0h.1M8 16c1-1.4 2.3-2 4-2s3 .6 4 2',
    alternate_email: 'M16 12a4 4 0 1 1-1.2-2.8V12a2 2 0 0 0 4 0 7 7 0 1 0-2.5 5.4',
    tag: 'M4 12 12 4h7v7l-8 8-7-7Zm11-5h.1',
    add_circle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v8m-4-4h8',
    schedule: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2',
    location_on: 'M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Zm0-8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    add: 'M12 5v14M5 12h14',
    masks: 'M5 8c3-2 5-2 7 0 2-2 4-2 7 0v4c0 4-3 6-7 7-4-1-7-3-7-7V8Zm3 4h2m4 0h2',
    shield_person: 'M12 3 19 6v5c0 4-2.8 7.4-7 9-4.2-1.6-7-5-7-9V6l7-3Zm0 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-4 4a4.5 4.5 0 0 1 8 0',
    sensors: 'M7 12a5 5 0 0 1 10 0m-13 0a8 8 0 0 1 16 0m-8 0h.1',
    history_edu: 'M4 6h12v12H4V6Zm12 3 4-2v10l-4-2',
    report_problem: 'M12 4 21 20H3L12 4Zm0 5v5m0 3h.1',
    forum: 'M4 5h13v9H8l-4 4V5Zm5 13h7l4 3V9',
    fingerprint: 'M12 11v3m-4-1a4 4 0 0 1 8 0c0 3-1 5-2 7m-6-3c.5-2 0-4 0-4a4 4 0 0 1 8 0m-11 1a7 7 0 0 1 14 0',
    inventory_2: 'M4 7 12 3l8 4v10l-8 4-8-4V7Zm0 0 8 4 8-4M12 11v10',
    send: 'M3 4.5 21 12 3 19.5v-6l10.5-1.5L3 10.5v-6Z',
    bookmark_border: 'M7 5h10v15l-5-3-5 3V5Z',
    arrow_back: 'M5 12h14M5 12l5-5M5 12l5 5',
    delete: 'M6 7h12M6 7l1 12h10l1-12M9 7V5h6v2m-4 4v5m2-5v5',
    check: 'M5 12l5 5L20 7',
  };

  return (
    <svg className={`app-icon ${filled ? 'filled' : ''}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name] ?? paths.dynamic_feed} />
    </svg>
  );
};

export default Icon;