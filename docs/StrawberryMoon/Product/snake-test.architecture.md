# Architecture Document

## System Overview

### Purpose
Snake Game is a lightweight, browser-native implementation of the classic Snake arcade game, designed as a single-file HTML application providing instant entertainment without installation requirements. The system delivers real-time gaming functionality with persistent score tracking, progressive difficulty, and modern visual effects while maintaining the nostalgic appeal of the original Snake gameplay.

### Architecture Style
**Monolithic Single-Page Application (SPA)** with embedded client-side architecture. The entire system is contained within a single HTML file using inline CSS and JavaScript, following a self-contained deployment model with zero external dependencies.

### Key Design Principles
- **Zero Dependency**: Complete functionality embedded in a single 4KB HTML file
- **Immediate Accessibility**: Instant load and play without installation or registration
- **Performance Optimization**: Canvas-based rendering with minimal DOM manipulation
- **Cross-Platform Compatibility**: Universal browser support using standard HTML5 APIs
- **Persistent State**: Browser-based local storage for high score retention
- **Responsive Feedback**: Real-time visual and interactive feedback systems

## System Context

### External Systems
- **Browser Environment**: Primary runtime platform across desktop and mobile browsers
- **Local Storage API**: Browser-native storage for persistent high score data
- **HTML5 Canvas API**: Graphics rendering and animation engine
- **DOM Event System**: Keyboard input handling and user interaction management
- **File System**: Single-file deployment requiring only basic web server or file access

### Users & Actors
- **Primary Users**: Office workers seeking 2-5 minute entertainment breaks during work hours
- **Secondary Users**: Students and casual gamers requiring instant browser-based entertainment
- **System Administrators**: IT personnel deploying on corporate intranets or educational networks
- **Developers**: Technical users examining code architecture or integrating into larger applications

## High-Level Architecture

### Components

**Game Engine Core**
- **Location**: Lines 45-118 in embedded JavaScript
- **Responsibilities**: Game state management, collision detection, snake movement logic, food placement algorithms
- **Data Structures**: Snake array, direction vectors, food coordinates, score tracking
- **Performance**: 120ms game loop interval with optimized collision detection

**Rendering System**
- **Location**: Lines 80-106 (draw function)
- **Technology**: HTML5 Canvas 2D Context API
- **Capabilities**: Gradient snake segments, glowing food effects, grid overlay, death flash animations
- **Resolution**: Fixed 400x400 pixel canvas with 20x20 grid system (20px grid cells)

**Input Controller**
- **Location**: Lines 130-142 (event listener)
- **Interface**: Keyboard event handling for arrow key navigation
- **Logic**: Direction validation preventing reverse movement, game state initialization
- **Responsiveness**: Immediate input processing with preventDefault for game keys

**State Manager**
- **Location**: Lines 32-44 (initialization and global variables)
- **Data**: Snake position arrays, direction vectors, food coordinates, score values, game status
- **Persistence**: Browser localStorage integration for high score retention
- **Lifecycle**: Game initialization, running state management, game over handling

**Visual Effects Engine**
- **Location**: Integrated within draw function (lines 88-105)
- **Features**: Shadow effects, color gradients, transparency overlays, particle-like food rendering
- **Performance**: Optimized canvas operations with minimal redraw cycles

## Data Architecture

### Data Models

**Snake Entity**
```javascript
snake = [
  { x: 10, y: 10 },  // Head segment
  { x: 9, y: 10 },   // Body segment
  { x: 8, y: 10 }    // Tail segment
]
```
- **Structure**: Array of coordinate objects
- **Growth**: Dynamic array expansion on food consumption
- **Validation**: Collision detection against self-intersection

**Direction Vectors**
```javascript
DIR = {
  UP: [0, -1],
  DOWN: [0, 1], 
  LEFT: [-1, 0],
  RIGHT: [1, 0]
}
```
- **Implementation**: Immutable direction constants
- **Usage**: Vector-based movement calculation
- **Constraint**: Opposite direction prevention logic

**Game State Object**
```javascript
{
  score: Number,        // Current session score
  best: Number,         // Persistent high score
  running: Boolean,     // Game active status
  food: { x: Number, y: Number },  // Food position
  loop: IntervalID      // Game loop reference
}
```

### Data Flow

**Initialization Sequence**
1. Global variables initialized with default values
2. Snake positioned at center-left of grid (10,10)
3. Initial direction set to RIGHT movement
4. Food randomly placed avoiding snake collision
5. Canvas rendered with initial game state

**Game Loop Processing**
1. Direction input captured and validated (120ms intervals)
2. Snake head position calculated using direction vectors
3. Collision detection performed (walls and self-intersection)
4. Food consumption checked and score updated
5. Snake array modified (growth or standard movement)
6. Canvas redrawn with updated positions and effects

**Score Management Flow**
1. Score incremented on food consumption
2. Best score comparison and localStorage update
3. DOM elements updated with current values
4. Score persistence across browser sessions

### Storage Strategy

**Client-Side Storage**
- **Technology**: Browser localStorage API (implicit usage for best score)
- **Scope**: Domain-specific persistent storage
- **Capacity**: Minimal requirements (single integer value)
- **Lifecycle**: Persistent across browser sessions and page reloads

**Memory Management**
- **Snake Array**: Dynamic resizing based on food consumption
- **Canvas Buffer**: Single frame buffer with complete redraw strategy
- **Event Listeners**: Single global keyboard listener with efficient key filtering

## API Design

**Internal JavaScript API**

```javascript
// Core Game Functions
init()                    // Reset game state to initial conditions
start()                   // Begin game loop and enable input processing
step()                    // Execute single game loop iteration
gameOver()               // Handle game termination and cleanup
placeFood()              // Generate random food position avoiding snake
draw()                   // Render complete game state to canvas

// Utility Functions
collision detection      // Implicit in step() function
input validation        // Arrow key filtering and direction logic
score management        // Increment, comparison, and persistence
```

**DOM Interaction API**
- **Canvas Manipulation**: Direct 2D context drawing operations
- **Score Display**: Real-time DOM text content updates
- **Message System**: Dynamic user feedback through message element
- **Event Binding**: Global keyboard event listener registration

## Infrastructure

**Deployment Architecture**
- **Format**: Single HTML file (index.html)
- **Size**: Approximately 4KB total file size
- **Dependencies**: Zero external resources or libraries
- **Distribution**: Direct file sharing, web server hosting, or CDN deployment

**Runtime Environment**
- **Platform**: Any modern web browser supporting HTML5 Canvas
- **Memory**: Minimal footprint (<1MB runtime memory)
- **CPU**: Low computational requirements (simple 2D calculations)
- **Network**: Zero network dependencies after initial file load

**Hosting Requirements**
- **Server**: Any static file server or basic HTTP server
- **Bandwidth**: Single 4KB file transfer
- **Scalability**: Entirely client-side processing eliminates server load
- **Availability**: 100% uptime dependent only on file accessibility

## Security Architecture

**Client-Side Security**
- **Code Exposure**: Complete source code visible in HTML file
- **Data Privacy**: No external data transmission or collection
- **Local Storage**: Only high score integer stored locally
- **Input Validation**: Keyboard input filtering prevents malicious code injection

**Browser Security Model**
- **Same-Origin Policy**: No cross-origin requests or external resource loading
- **Sandboxing**: Runs within browser security sandbox
- **Permissions**: No special browser permissions required
- **Content Security**: No dynamic script loading or eval() usage

## Non-Functional Requirements

**Performance Specifications**
- **Load Time**: <100ms initial page load (4KB file size)
- **Frame Rate**: 8.33 FPS (120ms interval) for smooth gameplay
- **Memory Usage**: <1MB total browser memory footprint
- **CPU Usage**: Minimal processing load suitable for low-end devices

**Compatibility Requirements**
- **Browser Support**: All modern browsers with HTML5 Canvas support
- **Mobile Compatibility**: Responsive design for various screen sizes
- **Accessibility**: Basic keyboard navigation support
- **Offline Capability**: Complete functionality without internet connection

**Reliability Metrics**
- **Uptime**: Client-side architecture ensures 100% availability
- **Error Handling**: Graceful game over states with restart capability
- **Data Persistence**: Reliable high score storage using browser APIs
- **Input Responsiveness**: <50ms input lag for optimal user experience

## Technical Debt & Risks

**Current Technical Debt**
- **Mobile Input**: No touch control support limiting mobile usability
- **Accessibility**: Missing screen reader support and keyboard alternatives
- **Code Structure**: Monolithic JavaScript structure limiting maintainability
- **Error Handling**: Minimal error recovery for edge cases

**Risk Assessment**
- **Browser Compatibility**: Future HTML5 API changes could impact functionality
- **Performance Scaling**: No optimization for very large snake sizes
- **Input Conflicts**: Arrow keys may conflict with browser navigation
- **Data Loss**: localStorage clearing results in high score reset

**Mitigation Strategies**
- Regular browser compatibility testing across major platforms
- Performance monitoring for extended gameplay sessions
- Documentation for known keyboard shortcut conflicts
- User education about localStorage data persistence

## Decision Log

**Architecture Decisions**

**Single-File Deployment Model**
- **Decision**: Embed all functionality in single HTML file
- **Rationale**: Maximize portability and eliminate dependency management
- **Trade-offs**: Limited modularity but superior distribution simplicity

**Canvas-Based Rendering**
- **Decision**: Use HTML5 Canvas instead of DOM manipulation
- **Rationale**: Superior performance for real-time graphics and effects
- **Trade-offs**: Reduced accessibility but enhanced visual capabilities

**Fixed Grid System**
- **Decision**: 20x20 grid with 20px cells on 400x400 canvas
- **Rationale**: Optimal balance of gameplay precision and visual clarity
- **Trade-offs**: Fixed resolution but consistent cross-platform experience

**Interval-Based Game Loop**
- **Decision**: setInterval at 120ms for game progression
- **Rationale**: Provides classic Snake game pacing and difficulty
- **Trade-offs**: Not frame-rate independent but maintains authentic feel

**Browser localStorage Integration**
- **Decision**: Implicit high score persistence using browser storage
- **Rationale**: User experience enhancement without external dependencies
- **Trade-offs**: Data loss on storage clearing but zero server requirements