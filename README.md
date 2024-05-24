<h1 align="center">
    <strong>react-native-video-editor</strong>
</h1>

<p align="center">
   This is an ongoing project aimed at building an Instagram Reels editor 🎬 with all its features Into React Native 💙
</p>

<div align="center">

[Introduction](#introduction) •
[Installation](#installation) •
[Example](#example) •
[Documentation](#documentation) •
[Contributing](#contributing) •
[License](#license)

</div>

## Introduction

The React Native Video Editor provides functionalities for:
- Trimming single videos
- Editing multiple videos
- Displaying video frames and timelines
- Cutting video segments using FFmpeg

<div align="center">
  <img src="docs/assets/singleTrim.png" alt="Map Screenshot" title="Map Screenshot" width="25%">
</div>

<div align="center">
  <img src="docs/assets/multipleVideo.png" alt="Map Screenshot" title="Map Screenshot" width="25%">
</div>

<div align="center">
  <img src="docs/assets/video_compress.mp4" alt="Map Screenshot" title="Map Screenshot" width="25%">
</div>

## Installation

To get started with the React Native Video Editor, follow these steps:

### Prerequisites

- Node.js (>=18.x)
- React Native CLI or Expo CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

### Steps

1. **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/react-native-video-editor.git
    cd react-native-video-editor
    ```

2. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Install iOS dependencies:**
    ```bash
    cd ios
    pod install
    cd ..
    ```

4. **Run the application:**
    ```bash
    npm run android   # For Android
    npm run ios       # For iOS
    # or
    yarn android      # For Android
    yarn ios          # For iOS
    ```

### FFmpeg Integration
Ensure FFmpeg is properly integrated for handling video processing tasks. Refer to the official FFmpeg documentation for more details.
[ffmpeg-kit-react-native](https://www.npmjs.com/package/ffmpeg-kit-react-native)


## Contributing

We welcome contributions from the community. To contribute, follow these steps:

1. Fork the repository.
2. Create a new branch: git checkout -b feature/your-feature-name
3. Make your changes and commit them: git commit -m 'Add some feature'
4. Push to the branch: git push origin feature/your-feature-name
5. Submit a pull request.
6. Please ensure your code follows the project's coding standards and includes appropriate documentation and tests.


## License

```
MIT License


Copyright (c) 2024 Code Brew Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
