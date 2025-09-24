# 🌍 Group WanderVerse Builder

A specialized build service for React Native travel applications, designed to handle the unique requirements of group travel planning apps.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 🏗️ Architecture

```
group-wander-verse-builder/
├── 📄 Core Files
│   ├── Dockerfile                 # Optimized for React Native + travel features
│   ├── package.json              # Travel app dependencies
│   ├── server.js                 # Build service API
│   └── README.md                 # This file
│
├── 🛠️ Source Code (/src)
│   ├── /services
│   │   └── travelAppBuildService.js  # Travel-specific build logic
│   ├── /routes                   # API endpoints for builds
│   ├── /middleware              # Auth, logging, error handling
│   └── /utils                   # Logging, configuration
│
├── ☸️ Kubernetes (/k8s)
│   ├── travel-app-all-in-one.yaml  # Complete K8s deployment
│   ├── secrets management         # API keys, certificates
│   └── persistent storage         # Build artifacts, cache
│
├── 🔧 Scripts (/scripts)
│   ├── wanderverse-setup.sh      # Main deployment script
│   ├── travel-deploy.sh          # Management commands
│   └── cleanup.sh               # Resource cleanup
│
└── 📚 Documentation (/docs)
    ├── TRAVEL_API.md             # Travel-specific endpoints
    ├── DEPLOYMENT.md             # Detailed setup guide
    └── TROUBLESHOOTING.md        # Common issues & solutions
```

## 🌟 Features

- **Travel-Optimized Builds**: Specialized for group travel planning apps
- **React Native Support**: Full build pipeline for mobile travel experiences  
- **Kubernetes Ready**: Production-ready container orchestration
- **Scalable Architecture**: Microservice design for high availability
- **Travel APIs Integration**: Built-in support for maps, weather, booking APIs

## 🛠️ Development

```bash
# Start with live reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## 🚢 Deployment

### Docker
```bash
npm run docker:build
docker run -p 3000:3000 wander-verse-builder
```

### Kubernetes
```bash
npm run k8s:deploy
```

### Quick Setup
```bash
./scripts/wanderverse-setup.sh
```

## 📖 Documentation

- [Travel API Reference](./docs/TRAVEL_API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)  
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-travel-feature`)
3. Commit your changes (`git commit -m 'Add amazing travel feature'`)
4. Push to the branch (`git push origin feature/amazing-travel-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.