import prompts from 'prompts';

const config = await prompts([
  {
    name: 'title',
    type: 'text',
    message: 'Title for the application',
    validate: (text) => text.length === 0 ? 'Title is required' : true
  },
  {
    name: 'accessToken',
    type: 'text',
    message: 'Access token for CARTO API',
    validate: (text) => text.length === 0 ? 'Access token is required' : true
  },
  {
    name: 'apiBaseUrl',
    type: 'text',
    message: 'Base URL for CARTO API (optional)',
  }
])

console.log(config)
