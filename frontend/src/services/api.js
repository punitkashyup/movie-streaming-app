import axios from 'axios';

// Get environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Sample mock data for development
const MOCK_MOVIES = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    release_year: 1994,
    duration: 142,
    genre: "Drama",
    director: "Frank Darabont",
    cast: "Tim Robbins, Morgan Freeman, Bob Gunton",
    poster_url: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
    video_url: "https://example.com/videos/shawshank-redemption.mp4",
    rating: 9.3
  },
  {
    id: 2,
    title: "The Godfather",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    release_year: 1972,
    duration: 175,
    genre: "Crime, Drama",
    director: "Francis Ford Coppola",
    cast: "Marlon Brando, Al Pacino, James Caan",
    poster_url: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    video_url: "https://example.com/videos/godfather.mp4",
    rating: 9.2
  },
  {
    id: 3,
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    release_year: 2008,
    duration: 152,
    genre: "Action, Crime, Drama",
    director: "Christopher Nolan",
    cast: "Christian Bale, Heath Ledger, Aaron Eckhart",
    poster_url: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    video_url: "https://example.com/videos/dark-knight.mp4",
    rating: 9.0
  },
  {
    id: 4,
    title: "Pulp Fiction",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    release_year: 1994,
    duration: 154,
    genre: "Crime, Drama",
    director: "Quentin Tarantino",
    cast: "John Travolta, Uma Thurman, Samuel L. Jackson",
    poster_url: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    video_url: "https://example.com/videos/pulp-fiction.mp4",
    rating: 8.9
  },
  {
    id: 5,
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    release_year: 2010,
    duration: 148,
    genre: "Action, Adventure, Sci-Fi",
    director: "Christopher Nolan",
    cast: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
    poster_url: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    video_url: "https://example.com/videos/inception.mp4",
    rating: 8.8
  },
  {
    id: 6,
    title: "The Matrix",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    release_year: 1999,
    duration: 136,
    genre: "Action, Sci-Fi",
    director: "Lana Wachowski, Lilly Wachowski",
    cast: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
    poster_url: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    video_url: "https://example.com/videos/matrix.mp4",
    rating: 8.7
  }
];

const MOCK_USER = {
  id: 1,
  username: "testuser",
  email: "user@example.com",
  is_active: true,
  is_superuser: false,
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z"
};

const MOCK_ADMIN_USER = {
  id: 2,
  username: "admin",
  email: "admin@example.com",
  is_active: true,
  is_superuser: true,
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z"
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * subscriptionService - Service for subscription-related API calls
 */
export const subscriptionService = {
  getSubscriptionPlans: async () => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: [
              {
                id: 1,
                name: "Daily",
                description: "24-hour access to all movies in standard definition",
                price: 149,
                duration_days: 1,
                features: "Standard Definition,Watch on one device at a time,Full catalog access for 24 hours",
                is_active: true
              },
              {
                id: 2,
                name: "Weekly",
                description: "7-day access to all movies in HD quality",
                price: 599,
                duration_days: 7,
                features: "HD Quality,Watch on up to 2 devices at a time,Full catalog access for 7 days",
                is_active: true
              },
              {
                id: 3,
                name: "Monthly",
                description: "30-day access to all movies in HD and Ultra HD",
                price: 1199,
                duration_days: 30,
                features: "HD and Ultra HD,Watch on up to 4 devices at a time,Offline downloads,Full catalog access for 30 days",
                is_active: true
              }
            ]
          });
        }, 500);
      });
    }
    return api.get('/subscription-plans');
  },

  getMySubscription: async () => {
    if (USE_MOCK_DATA) {
      const userType = localStorage.getItem('userType');

      // If admin or no user, return no subscription
      if (userType === 'admin' || !userType) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                has_active_subscription: userType === 'admin',
                subscription_end_date: null,
                plan_name: null,
                days_remaining: null
              }
            });
          }, 500);
        });
      }

      // Mock subscription for regular users
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              has_active_subscription: true,
              subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              plan_name: "Premium",
              days_remaining: 30
            }
          });
        }, 500);
      });
    }
    return api.get('/subscriptions/me');
  },

  subscribe: async (planId, autoRenew = true) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              id: 1,
              user_id: 1,
              plan_id: planId,
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              is_active: true,
              auto_renew: autoRenew,
              plan: {
                id: planId,
                name: planId === 1 ? "Daily" : planId === 2 ? "Weekly" : "Monthly",
                price: planId === 1 ? 149 : planId === 2 ? 599 : 1199,
                duration_days: planId === 1 ? 1 : planId === 2 ? 7 : 30
              }
            }
          });
        }, 500);
      });
    }
    return api.post('/subscriptions', { plan_id: planId, auto_renew: autoRenew });
  },

  updateSubscription: async (subscriptionId, data) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              id: subscriptionId,
              ...data,
              user_id: 1,
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          });
        }, 500);
      });
    }
    return api.put(`/subscriptions/${subscriptionId}`, data);
  },

  checkAccess: async () => {
    if (USE_MOCK_DATA) {
      const userType = localStorage.getItem('userType');

      return new Promise((resolve) => {
        setTimeout(() => {
          if (userType === 'admin') {
            resolve({
              data: {
                has_access: true,
                message: "Admin access granted"
              }
            });
          } else if (userType === 'user') {
            resolve({
              data: {
                has_access: true,
                message: "Access granted. Your Weekly subscription is active.",
                days_remaining: 7,
                hours_remaining: 168
              }
            });
          } else {
            resolve({
              data: {
                has_access: false,
                message: "You need an active subscription to access this content."
              }
            });
          }
        }, 500);
      });
    }
    return api.get('/subscriptions/check-access');
  },

  // Admin subscription plan management
  createSubscriptionPlan: async (planData) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newPlan = {
            id: Math.floor(Math.random() * 1000) + 10, // Random ID that won't conflict with existing ones
            name: planData.name,
            description: planData.description,
            price: planData.price,
            duration_days: planData.duration_days,
            features: planData.features,
            is_active: planData.is_active !== undefined ? planData.is_active : true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          resolve({ data: newPlan });
        }, 500);
      });
    }
    return api.post('/subscription-plans', planData);
  },

  updateSubscriptionPlan: async (planId, planData) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (planId > 0) {
            const updatedPlan = {
              id: planId,
              ...planData,
              updated_at: new Date().toISOString()
            };

            resolve({ data: updatedPlan });
          } else {
            reject({
              response: { status: 404, data: { detail: "Subscription plan not found" } }
            });
          }
        }, 500);
      });
    }
    return api.put(`/subscription-plans/${planId}`, planData);
  },

  deleteSubscriptionPlan: async (planId) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (planId > 0) {
            // Check if it's one of the default plans (1, 2, 3)
            if (planId <= 3) {
              // Simulate having active subscriptions for default plans
              reject({
                response: {
                  status: 400,
                  data: {
                    detail: "Cannot delete plan with active subscriptions. Deactivate the plan instead."
                  }
                }
              });
            } else {
              resolve({
                data: {
                  success: true,
                  message: "Subscription plan has been deactivated successfully."
                }
              });
            }
          } else {
            reject({
              response: { status: 404, data: { detail: "Subscription plan not found" } }
            });
          }
        }, 500);
      });
    }
    return api.delete(`/subscription-plans/${planId}`);
  },

  // Admin subscription management
  getAllSubscriptions: async (status = null) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockSubscriptions = [
            {
              id: 1,
              user_id: 2,
              plan_id: 1,
              start_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
              end_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),   // 12 hours from now
              is_active: true,
              auto_renew: false,
              created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
              plan: {
                id: 1,
                name: "Daily",
                price: 149,
                duration_days: 1
              }
            },
            {
              id: 2,
              user_id: 3,
              plan_id: 2,
              start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
              end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),   // 4 days from now
              is_active: true,
              auto_renew: true,
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              plan: {
                id: 2,
                name: "Weekly",
                price: 599,
                duration_days: 7
              }
            },
            {
              id: 3,
              user_id: 4,
              plan_id: 3,
              start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
              end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),   // 15 days from now
              is_active: true,
              auto_renew: true,
              created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              plan: {
                id: 3,
                name: "Monthly",
                price: 1199,
                duration_days: 30
              }
            },
            {
              id: 4,
              user_id: 5,
              plan_id: 2,
              start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
              end_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),    // 3 days ago (expired)
              is_active: false,
              auto_renew: false,
              created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              plan: {
                id: 2,
                name: "Weekly",
                price: 599,
                duration_days: 7
              }
            }
          ];

          // Filter based on status
          let filteredSubscriptions = mockSubscriptions;
          if (status === 'active') {
            const now = new Date();
            filteredSubscriptions = mockSubscriptions.filter(sub =>
              sub.is_active && new Date(sub.end_date) > now
            );
          } else if (status === 'expired') {
            const now = new Date();
            filteredSubscriptions = mockSubscriptions.filter(sub =>
              !sub.is_active || new Date(sub.end_date) <= now
            );
          }

          resolve({
            data: filteredSubscriptions
          });
        }, 500);
      });
    }

    const params = status ? { status } : {};
    return api.get('/admin/subscriptions', { params });
  },

  getSubscriptionById: async (id) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const mockSubscription = {
            id: id,
            user_id: 2,
            plan_id: 2,
            start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            auto_renew: true,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            plan: {
              id: 2,
              name: "Weekly",
              price: 599,
              duration_days: 7
            }
          };

          if (id > 0 && id < 5) {
            resolve({
              data: mockSubscription
            });
          } else {
            reject({
              response: { status: 404, data: { detail: "Subscription not found" } }
            });
          }
        }, 500);
      });
    }

    return api.get(`/admin/subscriptions/${id}`);
  },

  extendSubscription: async (id, days) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (id > 0 && id < 5) {
            const mockSubscription = {
              id: id,
              user_id: 2,
              plan_id: 2,
              start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() + (4 + days) * 24 * 60 * 60 * 1000).toISOString(),
              is_active: true,
              auto_renew: true,
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              plan: {
                id: 2,
                name: "Weekly",
                price: 599,
                duration_days: 7
              }
            };

            resolve({
              data: mockSubscription
            });
          } else {
            reject({
              response: { status: 404, data: { detail: "Subscription not found" } }
            });
          }
        }, 500);
      });
    }

    return api.put(`/admin/subscriptions/${id}/extend`, { days });
  },

  cancelSubscription: async (id) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (id > 0 && id < 5) {
            const mockSubscription = {
              id: id,
              user_id: 2,
              plan_id: 2,
              start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
              is_active: false,
              auto_renew: false,
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              plan: {
                id: 2,
                name: "Weekly",
                price: 599,
                duration_days: 7
              }
            };

            resolve({
              data: mockSubscription
            });
          } else {
            reject({
              response: { status: 404, data: { detail: "Subscription not found" } }
            });
          }
        }, 500);
      });
    }

    return api.put(`/admin/subscriptions/${id}/cancel`);
  }
};

/**
 * userService - Service for user-related API calls
 */
export const userService = {
  getUser: async (id) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Mock user data
          if (id > 0 && id < 10) {
            resolve({
              data: {
                id: id,
                username: `user${id}`,
                email: `user${id}@example.com`,
                is_active: true,
                is_superuser: id === 1
              }
            });
          } else {
            reject({
              response: { status: 404, data: { detail: "User not found" } }
            });
          }
        }, 300);
      });
    }
    return api.get(`/users/${id}`);
  },

  getUsers: async () => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock users list
          const users = [
            { id: 1, username: "admin", email: "admin@example.com", is_active: true, is_superuser: true, created_at: "2023-01-01T00:00:00.000Z" },
            { id: 2, username: "user1", email: "user1@example.com", is_active: true, is_superuser: false, created_at: "2023-01-02T00:00:00.000Z" },
            { id: 3, username: "user2", email: "user2@example.com", is_active: true, is_superuser: false, created_at: "2023-01-03T00:00:00.000Z" },
            { id: 4, username: "user3", email: "user3@example.com", is_active: true, is_superuser: false, created_at: "2023-01-04T00:00:00.000Z" },
            { id: 5, username: "user4", email: "user4@example.com", is_active: false, is_superuser: false, created_at: "2023-01-05T00:00:00.000Z" }
          ];
          resolve({ data: users });
        }, 500);
      });
    }
    return api.get('/users');
  },

  createUser: async (userData) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Check if username or email already exists
          if (userData.username === 'admin' || userData.email === 'admin@example.com') {
            reject({
              response: {
                status: 400,
                data: { detail: "The user with this username or email already exists in the system." }
              }
            });
            return;
          }

          const newUser = {
            id: Math.floor(Math.random() * 1000) + 10,
            username: userData.username,
            email: userData.email,
            is_active: userData.is_active !== undefined ? userData.is_active : true,
            is_superuser: userData.is_superuser !== undefined ? userData.is_superuser : false,
            created_at: new Date().toISOString()
          };

          resolve({ data: newUser });
        }, 500);
      });
    }
    return api.post('/users', userData);
  },

  updateUser: async (userId, userData) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (userId > 0) {
            const updatedUser = {
              id: userId,
              username: userData.username || `user${userId}`,
              email: userData.email || `user${userId}@example.com`,
              is_active: userData.is_active !== undefined ? userData.is_active : true,
              is_superuser: userData.is_superuser !== undefined ? userData.is_superuser : false,
              created_at: "2023-01-01T00:00:00.000Z",
              updated_at: new Date().toISOString()
            };

            resolve({ data: updatedUser });
          } else {
            reject({
              response: { status: 404, data: { detail: "User not found" } }
            });
          }
        }, 500);
      });
    }
    return api.put(`/users/${userId}`, userData);
  },

  deleteUser: async (userId) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate error cases
          if (userId === 1) {
            reject({
              response: {
                status: 400,
                data: { detail: "Cannot delete the last admin user" }
              }
            });
            return;
          }

          if (userId <= 0 || userId > 1000) {
            reject({
              response: { status: 404, data: { detail: "User not found" } }
            });
            return;
          }

          resolve({
            data: {
              success: true,
              message: "User has been deleted successfully."
            }
          });
        }, 500);
      });
    }
    return api.delete(`/users/${userId}`);
  }
};

/**
 * authService - Service for authentication-related API calls
 */
export const authService = {
  login: async (email, password) => {
    if (USE_MOCK_DATA) {
      // Simulate login with mock data
      if (email === 'user@example.com' && password === 'password') {
        const mockToken = 'mock-jwt-token-user-' + Math.random().toString(36).substring(2);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('userType', 'user');

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              access_token: mockToken,
              token_type: 'bearer'
            });
          }, 500);
        });
      } else if (email === 'admin@example.com' && password === 'adminpassword') {
        const mockToken = 'mock-jwt-token-admin-' + Math.random().toString(36).substring(2);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('userType', 'admin');

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              access_token: mockToken,
              token_type: 'bearer'
            });
          }, 500);
        });
      } else {
        // Simulate login failure
        return Promise.reject({
          response: {
            status: 401,
            data: { detail: "Incorrect email or password" }
          }
        });
      }
    }

    const formData = new FormData();
    formData.append('username', email); // FastAPI OAuth2 expects 'username'
    formData.append('password', password);

    const response = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }

    return response.data;
  },

  register: async (username, email, password) => {
    if (USE_MOCK_DATA) {
      // Simulate registration with mock data
      if (email === 'user@example.com') {
        // Simulate email already exists error
        return Promise.reject({
          response: {
            status: 400,
            data: { detail: "The user with this email already exists in the system." }
          }
        });
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              id: Math.floor(Math.random() * 1000),
              username,
              email,
              is_active: true,
              is_superuser: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          });
        }, 500);
      });
    }

    return api.post('/users', { username, email, password });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
  },

  getCurrentUser: async () => {
    if (USE_MOCK_DATA) {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');

      if (!token) {
        return Promise.reject({
          response: { status: 401, data: { detail: "Not authenticated" } }
        });
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          if (userType === 'admin') {
            resolve({ data: MOCK_ADMIN_USER });
          } else {
            resolve({ data: MOCK_USER });
          }
        }, 500);
      });
    }

    return api.get('/users/me');
  },
};

/**
 * movieService - Service for movie-related API calls
 */
export const movieService = {
  getMovies: async (params = {}) => {
    if (USE_MOCK_DATA) {
      // Return mock data with a delay to simulate network request
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: MOCK_MOVIES });
        }, 500);
      });
    }
    return api.get('/movies', { params });
  },

  getMovie: async (id) => {
    if (USE_MOCK_DATA) {
      // Find movie by ID in mock data
      const movie = MOCK_MOVIES.find(m => m.id === parseInt(id));

      if (!movie) {
        return Promise.reject({
          response: { status: 404, data: { detail: "Movie not found" } }
        });
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: movie });
        }, 500);
      });
    }
    return api.get(`/movies/${id}`);
  },

  searchMovies: async (query) => {
    if (USE_MOCK_DATA) {
      // Filter movies by title or description containing the query
      const filteredMovies = query
        ? MOCK_MOVIES.filter(m =>
            m.title.toLowerCase().includes(query.toLowerCase()) ||
            m.description.toLowerCase().includes(query.toLowerCase())
          )
        : MOCK_MOVIES;

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: filteredMovies });
        }, 500);
      });
    }
    return api.get('/movies', { params: { search: query } });
  },

  getTranscodingStatus: async (movieId) => {
    if (USE_MOCK_DATA) {
      // Find movie by ID in mock data
      const movie = MOCK_MOVIES.find(m => m.id === parseInt(movieId));

      if (!movie) {
        return Promise.reject({
          response: { status: 404, data: { detail: "Movie not found" } }
        });
      }

      // Simulate transcoding status
      const mockStatus = {
        movie_id: movie.id,
        transcoding_status: Math.random() > 0.7 ? "COMPLETE" : "PROCESSING",
        is_transcoded: Math.random() > 0.7,
        streaming_url: Math.random() > 0.7 ? `https://example.com/movies/${movie.id}/hls/index.m3u8` : null
      };

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockStatus });
        }, 500);
      });
    }
    return api.get(`/movies/${movieId}/transcoding-status`);
  },

  // Admin functions for movie management
  createMovie: async (movieData) => {
    if (USE_MOCK_DATA) {
      // Create a new movie with mock data
      const newMovie = {
        ...movieData,
        id: Math.max(...MOCK_MOVIES.map(m => m.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      MOCK_MOVIES.push(newMovie);

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: newMovie });
        }, 500);
      });
    }
    return api.post('/movies', movieData);
  },

  updateMovie: async (id, movieData) => {
    if (USE_MOCK_DATA) {
      // Find and update movie in mock data
      const index = MOCK_MOVIES.findIndex(m => m.id === parseInt(id));

      if (index === -1) {
        return Promise.reject({
          response: { status: 404, data: { detail: "Movie not found" } }
        });
      }

      const updatedMovie = {
        ...MOCK_MOVIES[index],
        ...movieData,
        updated_at: new Date().toISOString()
      };

      MOCK_MOVIES[index] = updatedMovie;

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: updatedMovie });
        }, 500);
      });
    }
    return api.put(`/movies/${id}`, movieData);
  },

  deleteMovie: async (id) => {
    if (USE_MOCK_DATA) {
      // Find and remove movie from mock data
      const index = MOCK_MOVIES.findIndex(m => m.id === parseInt(id));

      if (index === -1) {
        return Promise.reject({
          response: { status: 404, data: { detail: "Movie not found" } }
        });
      }

      const deletedMovie = MOCK_MOVIES[index];
      MOCK_MOVIES.splice(index, 1);

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: deletedMovie });
        }, 500);
      });
    }
    return api.delete(`/movies/${id}`);
  },

  uploadMoviePoster: async (id, formData, onUploadProgress) => {
    if (USE_MOCK_DATA) {
      // Simulate poster upload
      const index = MOCK_MOVIES.findIndex(m => m.id === parseInt(id));

      if (index === -1) {
        return Promise.reject({
          response: { status: 404, data: { detail: "Movie not found" } }
        });
      }

      // Generate a fake poster URL
      const posterUrl = `https://example.com/posters/movie-${id}-${Date.now()}.jpg`;

      MOCK_MOVIES[index].poster_url = posterUrl;

      // Simulate upload progress with more realistic increments
      if (onUploadProgress) {
        let progress = 0;
        const totalSize = 1024 * 1024 * 5; // Simulate a 5MB file
        const interval = setInterval(() => {
          // Random increment between 5% and 15% of total
          const increment = Math.floor(Math.random() * (totalSize * 0.15 - totalSize * 0.05) + totalSize * 0.05);
          progress += increment;

          // Cap at total size
          if (progress > totalSize) {
            progress = totalSize;
          }

          onUploadProgress({ loaded: progress, total: totalSize });

          if (progress >= totalSize) {
            clearInterval(interval);
          }
        }, 500);
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { poster_url: posterUrl } });
        }, 3000); // Longer delay to simulate upload
      });
    }

    return api.post(`/movies/${id}/upload-poster`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress
    });
  },

  // Movie API search and details
  searchMovieAPI: async (title) => {
    if (USE_MOCK_DATA) {
      // Mock movie search results
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              results: [
                {
                  tmdb_id: 1,
                  title: `${title} - The Movie`,
                  release_year: 2023,
                  poster_path: "https://via.placeholder.com/300x450",
                  overview: "This is a mock movie description for testing purposes.",
                  vote_average: 7.5
                },
                {
                  tmdb_id: 2,
                  title: `${title} 2: The Sequel`,
                  release_year: 2021,
                  poster_path: "https://via.placeholder.com/300x450",
                  overview: "The exciting sequel to the original movie.",
                  vote_average: 6.8
                }
              ]
            }
          });
        }, 500);
      });
    }
    return api.get('/search-movies', { params: { title } });
  },

  getMovieDetails: async (tmdbId) => {
    if (USE_MOCK_DATA) {
      // Mock movie details
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              title: `Movie ${tmdbId}`,
              description: "This is a mock movie description for testing purposes.",
              release_year: 2023,
              duration: 120,
              genre: "Action, Adventure",
              director: "John Director",
              cast: "Actor One, Actor Two, Actor Three",
              poster_url: "https://via.placeholder.com/300x450",
              rating: 7.5
            }
          });
        }, 500);
      });
    }
    return api.get(`/movie-details/${tmdbId}`);
  },

  uploadMovieVideo: async (id, formData, onUploadProgress) => {
    if (USE_MOCK_DATA) {
      // Simulate video upload
      const index = MOCK_MOVIES.findIndex(m => m.id === parseInt(id));

      if (index === -1) {
        return Promise.reject({
          response: { status: 404, data: { detail: "Movie not found" } }
        });
      }

      // Generate a fake video URL
      const videoUrl = `https://example.com/videos/movie-${id}-${Date.now()}.mp4`;

      MOCK_MOVIES[index].video_url = videoUrl;

      // Simulate upload progress with more realistic increments for video (larger file)
      if (onUploadProgress) {
        let progress = 0;
        const totalSize = 1024 * 1024 * 50; // Simulate a 50MB file
        const interval = setInterval(() => {
          // Random increment between 3% and 10% of total
          const increment = Math.floor(Math.random() * (totalSize * 0.10 - totalSize * 0.03) + totalSize * 0.03);
          progress += increment;

          // Cap at total size
          if (progress > totalSize) {
            progress = totalSize;
          }

          onUploadProgress({ loaded: progress, total: totalSize });

          if (progress >= totalSize) {
            clearInterval(interval);
          }
        }, 400);
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { video_url: videoUrl } });
        }, 6000); // Even longer delay to simulate video upload
      });
    }

    return api.post(`/movies/${id}/upload-video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress
    });
  },
};

export default api;
