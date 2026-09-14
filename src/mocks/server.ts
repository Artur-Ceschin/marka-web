import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/** The MSW server used by tests. Started once in src/test/setup.ts. */
export const server = setupServer(...handlers);
