export const queryKeys = {
  users: {
    me: () => ['users', 'me'] as const,
    byId: (id: string) => ['users', id] as const,
  },
  plants: {
    byLatin: (latin: string) => ['plants', latin] as const,
  },
  explore: {
    nearby: (lat: number, lng: number, radius: number) =>
      ['explore', 'nearby', lat, lng, radius] as const,
  },
  feed: {
    list: () => ['feed'] as const,
  },
  notebook: {
    list: () => ['notebook'] as const,
    byId: (id: string) => ['notebook', id] as const,
  },
};
