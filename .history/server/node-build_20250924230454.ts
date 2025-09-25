import { createServer } from "./index";

const server = createServer();
const port = process.env.PORT || 8083;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});