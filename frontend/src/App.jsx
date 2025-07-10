import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {SocketProvider} from "./provider/socket"; // Capitalized
import { PeerProvider } from "./provider/peer";

import HomePage from "./pages/homepage";
import Room from "./pages/Room"

function App() {
  return (
    <Router>
      <SocketProvider> {/* Capitalized here too */}
        <PeerProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:roomId" element={<Room/>}/>
        </Routes>
        </PeerProvider>
      </SocketProvider>
    </Router>
  );
}

export default App;
