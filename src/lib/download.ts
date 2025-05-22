export const downloadJSON = (filename: string, content: any) => {
  const element = document.createElement("a");
  const file = new Blob([JSON.stringify(content, null, 2)], {
    type: "application/json",
  });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
