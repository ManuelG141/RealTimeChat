# RealTimeChat

RealTimeChat is a real-time chat application built with Node.js, Express, and Socket.IO. It allows users to connect, send messages, and see who is typing in real-time, .

## Features

- **Real-time messaging**: Users can send and receive messages instantly.
- **User notifications**: Users can see the users that are online when he connects to the page, and are notified when someone connects or disconnects.
- **Typing indicator**: Shows when a user is typing a message.
- **Message persistence**: Messages are stored in a PostgreSQL database.

## Technologies Used

- **Node.js**: JavaScript runtime environment for the server.
- **TypeScript**: Typed superset of JavaScript that compiles to plain JavaScript, used on server side.
- **Express**: Web framework for Node.js.
- **Socket.IO**: Library that enables low-latency, bidirectional and event-based communication between a client and a server.
- **PostgreSQL**: Relational database management system.
- **HTML/CSS**: For the structure and design of the user interface.
- **JavaScript**: For client-side logic.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/RealTimeChat.git
    cd RealTimeChat
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    `DB_ENDPOINT=your_database_host`, `DB_PORT=your_database_port`, `DB_USER=your_database_user`,
    `DB_PASSWORD=your_database_password`, `DB_NAME=your_database_name`, `PORT=port_to_run_the_server`

2. C

4. Start the server:
    ```sh
    npm run start
    ```

5. Open your browser and navigate to `http://localhost`, if you change `PORT` enviromental variable you have to change the url too, for example, if `PORT=3000` then you have to navigate to `http://localhost:3000`.

## Usage

1. Open the application in your browser.
2. Enter a message in the input field and press "Send" to send it.
3. You will see messages from other users in real-time.