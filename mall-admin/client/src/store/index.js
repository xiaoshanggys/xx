import { createStore } from 'vuex';
import auth from './modules/auth';
import app from './modules/app';

const store = createStore({
  modules: {
    auth,
    app
  },
  strict: process.env.NODE_ENV !== 'production'
});

export default store; 