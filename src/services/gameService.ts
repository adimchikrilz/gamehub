// src/services/gameService.ts
import api from './api';

interface Category {
  id: string;
  name: string;
  // Add other category properties
}

interface TriviaSession {
  id: string;
  // Add other session properties
}

const GameService = {
  // Get all trivia categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch categories');
    }
  },

  // Create a new trivia game session
  createTriviaSession: async (data: any): Promise<TriviaSession> => {
    try {
      const response = await api.post('/create_trivia_session', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create game session');
    }
  },

  // Get a new question
  getNewQuestion: async (): Promise<any> => {
    try {
      const response = await api.get('/new_request');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch new question');
    }
  },

  // Add more game-related API calls as needed
};

export default GameService;