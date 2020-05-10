/**
 * Manages an empty <div> as a child of the document body.
 * @returns a reference to the container Element or null if it hasn't been created yet.
 */
export function useContainer() {
  const [container, setContainer] = useState(null);
  useEffect(() => {
    const newContainer = document.createElement('div');
    document.body.appendChild(newContainer);
    setContainer(newContainer);
    return () => newContainer.remove();
  }, []);

  return container;
}
