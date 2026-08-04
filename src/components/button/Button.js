export default function Button({ name, onClick, children }) {
    return <button onClick={onClick}>{children}</button>;
}
