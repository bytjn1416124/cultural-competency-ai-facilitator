# Cultural Competency AI Facilitator

An interactive AI-powered facilitator for cultural competency sessions using OpenAI's Realtime API. Features voice interaction, real-time animations, and a comprehensive facilitation script.

![Interface Preview](docs/images/preview.png)

## Features

- 🎙️ Voice interaction with OpenAI's Realtime API
- 🎯 Real-time voice activity detection (VAD)
- 🎨 Interactive animations (Gradient, Vertex Mesh, and Strawberry)
- 📚 Structured cultural competency curriculum
- ⚡ Real-time response streaming
- 🌙 Dark mode support

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

## Installation

### Windows

1. Clone the repository:
   ```bash
   git clone https://github.com/bytjn1416124/cultural-competency-ai-facilitator.git
   cd cultural-competency-ai-facilitator
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file:
   ```bash
   copy .env.example .env.local
   ```

4. Add your OpenAI API key to `.env.local`:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### macOS/Linux

1. Clone the repository:
   ```bash
   git clone https://github.com/bytjn1416124/cultural-competency-ai-facilitator.git
   cd cultural-competency-ai-facilitator
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your OpenAI API key to `.env.local`:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage

1. Open http://localhost:3000 in your browser
2. Grant microphone permissions when prompted
3. Hold space to talk with the AI facilitator
4. Release space to end your message

## Configuration

Adjust settings in `.env.local`:

- `NEXT_PUBLIC_VAD_THRESHOLD`: Voice activity detection sensitivity (0-1)
- `NEXT_PUBLIC_VAD_SILENCE_DURATION`: Silence duration before processing (ms)
- `NEXT_PUBLIC_DEFAULT_VOICE`: AI voice selection
- `NEXT_PUBLIC_DEBUG_MODE`: Enable debug information

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
