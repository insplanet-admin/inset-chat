# inset-chat

## 설치

`npm install`

## 작동.

`npm run dev`

MSW 자동으로 실행.

```
// main.jsx
async function enableMocking() {
  if (!import.meta.env.DEV) return;

  const { worker } = await import("./mocks/browser.js");
  await worker.start({
    onUnhandledRequest: "bypass", // 모킹 안 된 요청은 실제로 통과
  });

  console.log("[MSW] worker started");
}
```

### MSW란

서버에서 주는 api를 가로채서 결과를 변경 또는 새롭게 주는 방식. <br/>
주로 FrontEnd 와 BackEnd 나눠서 작업을 시작할때 FrontEnd는 BackEnd의 결과를 기다려야 하는 상황에서 <br/>우선 api가 완성 되었다 치고 더미데이터를 api로 쏴서 마치 api로 받은 것처럼 할 때 사용.
-> 그렇기에 꼭 dev 처리를 해야합니다.

`if (!import.meta.env.DEV) return;`

## reactQuery

### useMutation

```
  const chatMutation = useMutation({
    mutationFn: postChat,
    onSuccess: (data, variables) => {
      const id = variables.id;
      const text = data?.text ?? "";
      if (!text) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id == id
            ? { ...m, role: "other", content: text, status: "done" }
            : m,
        ),
      );
    },
    onError: (err, variables) => {
      const id = variables.id;

      setMessages((prev) =>
        prev.map((m) =>
          m.id == id
            ? {
                ...m,
                role: "other",
                content: "다시 시도해주세요. 죄송합니다.",
                status: "error",
              }
            : m,
        ),
      );
    },
  });

```

성공 시에 response에서 text를 가져와서 그에 맞게 json 형식으로 추가. <br>
에러도 마찬가지 입니다. <br>
추가로 전송 중일때는 status에 pending을 추가하여 진행 중 상황도 나타냈습니다.

### Message Json

```
  {
      id: id,
      role: "other",
      content: "",
      status: "pending",
  }
```

- role : me / other
  - 내가 보낸 것 / 남이 보낸 것 으로 나눠서 색상과 정렬의 위치를 이용하여 누가 보냈는 지 css 처리를 했습니다.
- content : 내용
- status : done / pending / error
  - content가 문제없이 들어왔을 때 done를 넣었으며, 결과를 받는 도중에는 pending으로 <br>loading 처리를 해줬습니다.
  - error에서는 빨간 배경으로 변경하여 잘못된 것을 알렸습니다.

  ![image](https://private-user-images.githubusercontent.com/87432059/540926246-89375577-e53e-4e29-97cd-7c73aa66abe7.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Njk1OTA4MzgsIm5iZiI6MTc2OTU5MDUzOCwicGF0aCI6Ii84NzQzMjA1OS81NDA5MjYyNDYtODkzNzU1NzctZTUzZS00ZTI5LTk3Y2QtN2M3M2FhNjZhYmU3LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjAxMjglMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwMTI4VDA4NTUzOFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTljZTYyZTk4NTQ2N2MwMDU5MmFlYjk3ZjQ3M2Y1ZjQwMmU2ZTMxZWM0OTFhZDkxMTU1OWIwZmM0ZjZjNzc4ZWQmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.UncV86HIGgCHROb-UxLGxUHeppjzf5-k_stQ-X4Czfo)

### AI의 경우

무조건 답변을 해주기 때문에 사용자가 메세지를 보내면 바로 pending으로 사용자측에 하나를 만들고 <br>
그 결과가 나오면 id를 비교해서 `status: pendding`인 데이터를 변경해줬습니다.
