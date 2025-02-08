# Quiz Generator

A TypeScript-based application that generates quizzes using LangChain, various AI models (OpenAI, Google AI, Hugging Face), and document embeddings. It processes documents from various sources including PDFs and Notion, and uses FAISS for efficient vector search.

## Features

- Multiple AI model support (OpenAI, Google VertexAI, Google Gemini, Hugging Face)
- Document processing and embedding generation
- Vector search using FAISS
- Notion integration for document sourcing
- PDF document processing
- Firebase integration
- Containerized deployment with Docker
- Google Cloud ready
- Built with Hono for high-performance API endpoints

## Project Structure

```
├── src/
│   ├── app.ts              # Express application setup
│   ├── env.ts              # Environment configuration
│   ├── index.ts            # Application entry point
│   ├── libs/
│   │   └── firebase.ts     # Firebase configuration and utilities
│   ├── routes/
│   │   ├── embedding.ts    # Embedding generation endpoints
│   │   └── search.ts       # Search functionality endpoints
│   └── utils/
│       ├── file.ts         # File handling utilities
│       └── object.ts       # Object manipulation utilities
├── tests/                  # Test files
├── docs/                   # Documentation and source PDFs
├── Dockerfile             # Container configuration
└── deploy.sh             # Deployment script
```

## Prerequisites

- Node.js (v18 or later recommended)
- pnpm
- Docker (for containerized deployment)
- Google Cloud SDK (for Google Cloud deployment)
- Firebase project credentials
- API keys for chosen AI providers (OpenAI/Google/Hugging Face)
- Notion API credentials (if using Notion integration)

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example.yaml .env.yaml
```
Edit `.env.yaml` with your configuration values.

## Development

Start the development server:
```bash
pnpm dev        # Run with hot reload using tsx
```

Build the project:
```bash
pnpm build      # Build TypeScript files
pnpm start      # Run the built version
```

Run tests:
```bash
pnpm test       # Run tests with Vitest
```

Format and lint code:
```bash
pnpm format     # Format code using Biome
pnpm check      # Run Biome checks
pnpm lint       # Run Biome linter
```

## Deployment

### Docker

Build the container:
```bash
docker build -t quiz-generator .
```

Run locally:
```bash
docker run -p 3000:3000 quiz-generator
```

### Google Cloud

Deploy to Google Cloud:
```bash
sh deploy.sh
```

## Key Dependencies

- LangChain - Framework for building AI applications
- FAISS - Efficient similarity search and clustering of dense vectors
- Hono - Fast, lightweight web framework
- Firebase Admin - Backend Firebase integration
- PDF Parse - PDF document processing
- Notion API - Notion integration
- Biome - Code formatting and linting
- Vitest - Unit testing framework

## License

ISC
