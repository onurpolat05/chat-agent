import ReactDOM from 'react-dom/client';
import App from './App';

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// @ts-ignore
window.initChatUI = (
  containerId: string,
  apiKey: string,
  chatPosition: 'left' | 'right' = 'right',
  defaultMessage?: string,
  fetchOnOpen?: boolean,
) => {
  const container = document.getElementById(containerId);
  if (container) {
    const chatRoot = ReactDOM.createRoot(container);
    chatRoot.render(
      <App
        apiKey={apiKey}
        chatPosition={chatPosition}
        defaultMessage={defaultMessage}
        fetchOnOpen={fetchOnOpen}
      />
    );
  }
};
