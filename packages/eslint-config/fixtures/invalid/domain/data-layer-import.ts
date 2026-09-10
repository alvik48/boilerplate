import { findUser } from '../data/users.repository';

export const load = (id: string) => findUser(id);
