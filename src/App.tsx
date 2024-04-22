import './App.css';
import Scene from './Scene';  // Adjust the import path according to your file structure

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>3D Cube Animation</h1>
        <main>
            {/* The Scene component renders the 3D Cube */}
            <Scene />
        </main>
      </header>
    </div>
  );
}

export default App;