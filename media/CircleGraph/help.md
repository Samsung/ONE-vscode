## Inside netron

view.View._model is circle model
view.Node.value is circle.Node

### Selection

netron selection
- view.View._selection[] items are grapher.Node instance
- selection are for `Find` sidebar dialog
- seems only one item can be selected
- node and edge are selectable

circle nodes
- view.View._selectionNodes[] items are circle.Node instance
- `Find` click will call hightlight, no selection but just scroll
   - maybe flash that item will help
- `click` node will select the node
   - view.View._selection[] and view.View._selectionNodes[] are updated
   - `click` again will de-select the item
