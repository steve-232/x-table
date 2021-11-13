# X-table

HTML table with superpowers.

- [x] Sorting
- [x] Searching
- [x] Pagination

## Installation

Inside the HTML page, insert these two lines.

```html
<link rel="stylesheet" href="path/to/the/file/x-table.min.css" />

<script src="path/to/the/file/x-table.min.js"></script>
```

## Usage

```js
const table = document.querySelector(".table");

new Xtable({
  el: table,
  headers: [
    "Name",
    { text: "Email", sortable: true },
    "Phone",
    { text: "Company", sortable: true },
    { text: "Country", sortable: true },
  ],
  items: [
    [
      "Emery Charles",
      "arcu.imperdiet@semsempererat.org",
      "1-461-205-5141",
      "Eu Corp.",
      "Australia",
    ],
    [
      "Raymond Lindsay",
      "ornare.fusce@enim.org",
      "1-335-875-6617",
      "Tincidunt Tempus Inc.",
      "Peru",
    ],
    [
      "Ifeoma Nixon",
      "quam.dignissim@sitamet.org",
      "1-860-379-3277",
      "Fusce Mi Institute",
      "Peru",
    ],
  ],
  rowsPerPage: 1,
  search: false,
});
```

## Options

| Option      | Type                                                                                 | Default   | Description                                                                                                |
| ----------- | ------------------------------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------- |
| el          | HTML Element                                                                         | undefined | Create the table inside this element.                                                                      |
| headers     | string[] = ["Title 1", "Title 2] <br /> {}[] = [{ text: "Title 1", sortable: true }] | []        | List of titles.                                                                                            |
| items       | string[][] = [["Name 1", "email 1"], ["Name 2", "email 2"]]                          | []        | List of items displayed inside the table.                                                                  |
| rowsPerPage | Number                                                                               | 10        | The number of displayed rows inside the Table. Number "0" turns off the pagination and displays all items. |
| search      | Boolean                                                                              | true      | Show or hide "search bar".                                                                                 |

## License

[MIT license](http://www.opensource.org/licenses/MIT)
