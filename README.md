# TX Explain Frontend

This is the frontend codebase for the TX Explain application. It provides a user interface for selecting a network, entering a transaction hash, and displaying the simulation and explanation results for the transaction.

## Features

- Select a network (Ethereum, Arbitrum, Optimism, Avalanche)
- Enter a transaction hash
- Display transaction summary, token transfers, and function calls
- Real-time streaming of explanation results

## Technologies Used

- Next.js
- React
- TypeScript
- Mantine UI library
- Tanstack Query (React Query)
- Zustand (state management)

## Getting Started

1. Clone the repository:

```bash
   git clone https://github.com/eden-network/tx-explain-frontend.git
```

2. Install the dependencies:
```bash
cd tx-explain-frontend
npm install
```

3. Set up the environment variables: Create a .env.local file in the root directory and provide the necessary environment variables:
```
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```
Replace http://localhost:3001 with the URL of your backend server.

4. Start the development server:
```bash
npm run dev
```

5. The frontend application will be accessible at http://localhost:3000.

## Folder Structure
components/: Contains reusable components used in the application.

pages/: Contains the pages of the application.

store/: Contains the Zustand store for state management.

styles/: Contains global styles and CSS files.

types/: Contains TypeScript type definitions.

utils/: Contains utility functions.

## Mock Server
The frontend application requires a backend server to fetch transaction data and explanation results. A mock server is provided in the root of this repository for testing purposes. To use the mock server, run:
    
```bash
npm run mock
```

## License
This project is licensed under the MIT License.