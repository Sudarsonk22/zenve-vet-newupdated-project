
export const ENDPOINTS = {
  auth: {
    me: '/auth/me',
  },
  meta: {
    specialties: '/meta/specialties',
    animalTypes: '/meta/animal-types',
  },
  users: {
    profile: (id) => `/users/${id}`,
    follow: (id) => `/users/${id}/follow`,
  },
  videos: {
    list: '/videos', 
    categories: '/videos/categories',
    upload: '/videos', 
    detail: (id) => `/videos/${id}`, 
    like: (id) => `/videos/${id}/like`, 
    save: (id) => `/videos/${id}/save`,
    comments: (id) => `/videos/${id}/comments`, 
    share: (id) => `/videos/${id}/share`, 
    view: (id) => `/videos/${id}/view`, 
    saved: '/videos/saved',
    history: '/videos/history',
  },
  conversations: {
    list: '/conversations', 
    messages: (id) => `/conversations/${id}/messages`, 
    read: (id) => `/conversations/${id}/read`, 
    pin: (id) => `/conversations/${id}/pin`, 
    archive: (id) => `/conversations/${id}/archive`, 
  },
  messages: {
    attachments: '/messages/attachments',
    reactions: (id) => `/messages/${id}/reactions`, 
  },
  search: {
    people: '/search/people',
    videos: '/search/videos',
    posts: '/search/posts',
    cases: '/search/clinical-cases',
    communities: '/search/communities',
    suggestions: '/search/suggestions',
  },
};
