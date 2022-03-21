This test folder contains a model directory for test.

`model.tflite` contains the following graph:

```
%1 = placeholder  (f32, [1,1,1,32])
%2 = placeholder  (f32, [1,1,1,32])
%3 = truediv(%1, %2)
```
