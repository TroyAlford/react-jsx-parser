export default function hasDoctype(jsx) {
  return /<(\/?|!?)DOCTYPE html>/.test(jsx) &&
    /<(\/?|!?)html>/.test(jsx) &&
    /<(\/?|!?)head>/.test(jsx) &&
    /<(\/?|!?)body>/.test(jsx)
}

