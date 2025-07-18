# Credit Card AI Agent

An intelligent AI-powered assistant that helps users find the most optimal credit card based on their specific needs, spending patterns, and financial goals.

## 🎯 Overview

The Credit Card AI Agent leverages advanced AI models (OpenAI GPT-4.1 and Anthropic Claude-3.5-Sonnet) with real-time web search capabilities to provide personalized credit card recommendations. The system analyzes user preferences, searches for current offers and terms, and presents structured recommendations with detailed comparisons.

## ✨ Key Features

### 🤖 Dual AI Provider Support
- **OpenAI GPT-4.1** with web search capabilities using the Responses API
- **Anthropic Claude-3.5-Sonnet** with web search tools
- Automatic provider fallback for high availability
- Real-time provider switching

### 🔍 Intelligent Web Search
- Real-time access to current credit card offers
- Searches trusted financial websites (NerdWallet, Credit Karma, Bankrate, etc.)
- Up-to-date information on APRs, fees, and promotional bonuses
- Transparent source citations

### 💳 Smart Credit Card Analysis
- Personalized recommendations based on spending patterns
- Detailed comparisons across multiple criteria:
  - Rewards and cashback rates
  - Annual fees and APR ranges
  - Sign-up bonuses and promotional offers
  - Benefits and perks
  - Credit score requirements
- Structured card data with enhanced metadata

### 🎨 Modern User Interface
- Clean, responsive design built with shadcn/ui
- Real-time streaming responses
- Interactive chat interface with suggestions
- Dark/light mode support
- File attachment capabilities (disabled by default)

### 🚀 Technical Excellence
- Server-Sent Events (SSE) for real-time streaming
- Rate limiting and request validation
- Error handling with automatic fallbacks
- TypeScript support for type safety
- Next.js 15 with App Router

## 🏗️ Architecture

### Frontend Components
```
src/components/
├── chat/
│   ├── ChatInterface.tsx    # Main chat interface
│   ├── ChatInput.tsx       # Message input component
│   └── ChatMessage.tsx     # Message display component
├── layout/
│   └── MainLayout.tsx      # Main application layout
└── ui/
    ├── ProviderSelector.js # AI provider selection
    └── [shadcn components] # UI component library
```

### Backend API
```
src/app/api/
├── chat/
│   └── route.js           # Main chat endpoint
├── search/
│   └── route.js           # Search endpoint
└── utils/
    ├── openai.js          # OpenAI service utilities
    ├── anthropic.js       # Anthropic service utilities
    ├── providers.js       # Provider management
    └── validation.js      # Request validation
```

### Data Flow
1. User selects AI provider (OpenAI/Anthropic)
2. User submits credit card query
3. System analyzes request and routes to appropriate AI service
4. AI performs web search for current information
5. Response streams back with structured recommendations
6. Credit cards are parsed and enhanced with metadata

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- OpenAI API Key (optional)
- Anthropic API Key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cc-ai-agent.git
   cd cc-ai-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   # OpenAI Configuration (optional)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Anthropic Configuration (optional)
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # Default AI Provider (optional, defaults to 'anthropic')
   AI_PROVIDER=openai
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### AI Providers

The system supports both OpenAI and Anthropic. You can configure one or both:

- **OpenAI only**: Set `OPENAI_API_KEY`
- **Anthropic only**: Set `ANTHROPIC_API_KEY`
- **Both providers**: Set both API keys for maximum reliability

### Web Search Domains

The Anthropic provider searches these trusted financial domains:
- NerdWallet, Credit Karma, Bankrate
- Chase, American Express, Discover, Capital One
- Citi, Wells Fargo, US Bank
- Credit Cards, WalletHub, The Points Guy
- Credit monitoring services

### Rate Limiting

- Rate limiting is enabled by default
- Limits are applied per IP address
- Configurable in `src/app/api/utils/validation.js`

## 📖 Usage Examples

### Basic Credit Card Search
```
"I'm looking for a cashback credit card for groceries and gas"
```

### Specific Comparisons
```
"Compare Chase Sapphire Preferred vs Capital One Venture X"
```

### Targeted Recommendations
```
"Best travel credit card with no annual fee for someone with excellent credit"
```

### Business Cards
```
"Show me business credit cards with the highest sign-up bonuses"
```

## 🛠️ Development

### Project Structure
```
cc-ai-agent/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── globals.css       # Global styles
│   │   ├── layout.js         # Root layout
│   │   └── page.js           # Home page
│   ├── components/           # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── utils/               # Helper functions
├── public/                  # Static assets
├── API_DOCUMENTATION.md     # Detailed API docs
└── README.md               # This file
```

### Key Technologies
- **Frontend**: React 19, Next.js 15, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Framer Motion
- **AI**: OpenAI GPT-4.1, Anthropic Claude-3.5-Sonnet
- **Streaming**: Server-Sent Events (SSE)
- **Styling**: Tailwind CSS with CSS variables

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🔒 Security & Privacy

- API keys are securely stored in environment variables
- Rate limiting prevents abuse
- Input validation on all endpoints
- No sensitive data is logged or stored
- CORS protection enabled

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
The application works on any platform supporting Next.js:
- Netlify
- Railway
- AWS
- Google Cloud
- Azure

## 📊 API Documentation

Detailed API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md), including:
- Complete API reference
- Request/response formats
- Error handling
- Component flow diagrams
- Provider configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [OpenAI](https://openai.com/) for GPT-4.1 and web search capabilities
- [Anthropic](https://anthropic.com/) for Claude-3.5-Sonnet
- [Next.js](https://nextjs.org/) for the React framework
- [Vercel](https://vercel.com/) for deployment platform

## 📞 Support

For support, please open an issue on GitHub or contact [your-email@example.com](mailto:your-email@example.com).

---

**Built with ❤️ to help people make informed credit card decisions**