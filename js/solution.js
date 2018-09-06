'use strict'

// ~~~~~~~~~~ global variables  ~~~~~~~~~~  //
const app = document.querySelector('.app');
const menu = document.querySelector('.menu');
const inputImage = document.querySelector('.menu__item.new');
const background = document.querySelector('.current-image');
const shareMenu = document.querySelector('.share');
const burgerMenu = document.querySelector('.burger');
const commentsMenu = document.querySelector('.comments');
const commentsToggle = document.querySelectorAll('.menu__toggle');
const drawMenu = document.querySelector('.draw');
const drawArea = document.createElement('canvas');
const ctx = drawArea.getContext("2d");
const mask = new Image;
let wsConnection;
let dragMenu = null;
let drawing = false;
let menuHeight = menu.offsetHeight;
const newCommentForm = {
  name: 'form',
  attributes: {
    'class': "comments__form"
  },
  childs: [{
      name: 'span',
      attributes: {
        'class': "comments__marker"
      }
    },
    {
      name: 'input',
      attributes: {
        'type': "checkbox",
        'class': "comments__marker-checkbox"
      }
    },
    {
      name: 'div',
      attributes: {
        'class': "comments__body active",
      },
      childs: [{
          name: 'div',
          attributes: {
            'class': "comment"
          },
          childs: {
            name: 'div',
            attributes: {
              'class': "loader",
              'style': "display: none"
            },
            childs: [{
                name: 'span'
              },
              {
                name: 'span'
              },
              {
                name: 'span'
              },
              {
                name: 'span'
              },
              {
                name: 'span'
              }
            ]
          }
        },
        {
          name: 'textarea',
          attributes: {
            'class': "comments__input",
            'type': "text",
            'placeholder': "Напишите ваш комментарий..."
          }
        },
        {
          name: 'input',
          attributes: {
            'class': "comments__close",
            'type': "button",
            'value': "Закрыть"
          }
        },
        {
          name: 'input',
          attributes: {
            'class': "comments__submit",
            'type': "submit",
            'value': "Отправить"
          }
        }
      ]
    }
  ]
}
const newComment = {
  name: 'div',
  attributes: {
    'class': "comment"
  },
  childs: [{
      name: 'p',
      attributes: {
        'class': "comment__time"
      }
    },
    {
      name: 'p',
      attributes: {
        'class': "comment__message"
      }
    }
  ]
}
const formContainer = createElement({
  name: 'div',
  attributes: {
    'class': "form-container"
  }
});
const mainPath = 'https://maxdenaro.github.io';


// ~~~~~~~~~~ functions ~~~~~~~~~~ //
function menuPositionCalc(block) {
  let windowHeight = document.documentElement.clientHeight;
  let windowWidth = document.documentElement.clientWidth;
  let blockHeight = block.offsetHeight;
  let blockWidth = block.offsetWidth;
  let posTop = localStorage.menuTop ? localStorage.menuTop : (windowHeight - blockHeight) / 2;
  let posLeft = localStorage.menuLeft ? localStorage.menuLeft : (windowWidth - blockWidth) / 2;

  block.style.setProperty('--menu-top', posTop + "px");
   block.style.setProperty('--menu-left', posLeft + 'px');
  //защита от переламывания меню 
  checkWidth(menu, posLeft);
}

function checkWidth(block, posLeft) {
  if (block.offsetHeight > menuHeight + 5) {
    posLeft--;
    block.style.setProperty('--menu-left', posLeft + 'px');
    checkWidth(block, posLeft);
  } else {
    return;
  }
}

function createElement(node) {

  if ((typeof node === 'string')) {
    return document.createTextNode(node.toString());
  }

  if (Array.isArray(node)) {
    return node.reduce((f, elem) => {
      f.appendChild(createElement(elem));
      return f;
    }, document.createDocumentFragment());
  }

  const element = document.createElement(node.name);

  if (node.attributes) {
    Object.keys(node.attributes).forEach(
      key => element.setAttribute(key, node.attributes[key])
    );
  }

  if (node.childs) {
    element.appendChild(createElement(node.childs))
  };

  return element;
}

function showError(text) {
  menu.style.display = 'none';
  background.style.display = 'none';
  drawArea.style.display = 'none';
  mask.style.display = 'none';
  document.querySelector('.image-loader').style.display = 'none';
  document.querySelector('.error__message').innerText = text;
  document.querySelector('.error').style.display = '';
  app.addEventListener('click', hideError);
}

function hideError() {
  app.removeEventListener('click', hideError);
  menu.style.display = '';
  background.style.display = '';
  document.querySelector('.error').style.display = 'none';
  drawArea.style.display = '';
  mask.style.display = '';
}

function startingApp() {
  menu.dataset.state = 'initial';
  burgerMenu.style.display = 'none';
  menuPositionCalc(menu);
}

function loadBackground(file) {
  const {
    type
  } = file;
  if (type !== 'image/png' && type !== 'image/jpeg' && type !== 'image/pƒjpeg') {
    showError('Неверный формат файла. Пожалуйста, выберите изображение в формате .jpg или .png.');
    return;
  }
  background.removeAttribute('src');
  mask.removeAttribute('src');
  burgerMenu.style.display = '';
  createBackground(file);
}

function createBackground(img) {
  const imageForSend = new FormData;
  imageForSend.append('title', 'This is just background');
  imageForSend.append('image', img);
  hideComments();
  menu.style.display = 'none';
  document.querySelector('.image-loader').style.display = '';
  fetch('https://neto-api.herokuapp.com/pic', {
      body: imageForSend,
      method: 'POST'
    })
    .then(data => {
      return data.json();
    })
    .then(data => {
      wsConnect(data.id)
      shareImage(data);
    })
    .catch(showError);
}

function shareImage(data) {
  menu.dataset.state = 'selected';
  shareMenu.dataset.state = 'selected';
  if (data) {
    document.querySelector('.menu__url').setAttribute('value', `${mainPath}?${data.id}`);
  }
  menuPositionCalc(menu);
}

function toCommentsMenu() {
  Array.from(menu.children).forEach(item => {
    item.dataset.state = '';
  })
  menu.dataset.state = 'selected';
  commentsMenu.dataset.state = 'selected';

  if (commentsToggle[0].hasAttribute('checked')) {
    showComments();
  }
  //скрыть / показать комментарии
  commentsToggle[0].addEventListener('change', event => {
    commentsToggle[1].removeAttribute('checked');
    commentsToggle[0].setAttribute('checked', '');
    showComments();
  });

  commentsToggle[1].addEventListener('change', event => {
    commentsToggle[0].removeAttribute('checked');
    commentsToggle[1].setAttribute('checked', '');
    hideComments();
  })
  formContainer.style.zIndex = '3';
}

function showComments() {
  Array.from(document.querySelectorAll('.comments__form')).forEach(item => {
    item.style.display = '';
  })
}

function hideComments() {
  Array.from(document.querySelectorAll('.comments__form')).forEach(item => {
    item.style.display = 'none';
  })
}

function closeComments() {
  Array.from(document.querySelectorAll('.comments__body')).forEach(item => {
    if ((Array.from(item.children)).length === 4) {
      item.parentNode.parentNode.removeChild(item.parentNode);
    }
  });
  Array.from(document.querySelectorAll('.comments__body.active')).forEach(item => {
    item.classList.remove('active');
  })

}

function loadComments(comments) {
  const activeComment = app.querySelector('.comments__body.active');
  Object.keys(comments).forEach(key => {
    const commentId = comments[key].left + "&" + comments[key].top;
    let idCount = 0;
    const oldComments = Array.from(app.querySelectorAll('.comments__form'));
    oldComments.forEach(item => {
      if (item.dataset.commentId === commentId) {
        idCount++;
      }
    })
    if (idCount === 0) {
      createNewCommentBlock(comments[key].left, comments[key].top);
    }
    createNewCommentText(commentId, comments[key].timestamp, comments[key].message);

  });
  closeComments();
  if (activeComment) {
    activeComment.classList.add('active');
  }
}

function createNewCommentBlock(x, y) {
  let commentForm = createElement(newCommentForm);
  formContainer.appendChild(commentForm);
  commentForm.setAttribute('style', `top:${y}px; left:${x}px`);
  commentForm.dataset.commentId = x + '&' + y;
  let commentText = commentForm.querySelector('.comments__input');
  commentText.focus();
  // события для созданной формы комментария
  commentForm.children[1].addEventListener('click', event => {
    if (commentForm.lastElementChild.classList.contains('active')) {
      closeComments();
    } else {
      closeComments();
      commentForm.lastElementChild.classList.add('active');
      commentText.focus();
    }
  })

  commentForm.querySelector('.comments__close').addEventListener('click', closeComments);

  commentForm.querySelector('.comments__submit').addEventListener('click', event => {
    event.preventDefault();
    let commentText = commentForm.querySelector('.comments__input');
    commentText.focus();
    if (commentText.value) {
      commentForm.querySelector('.loader').style.display = '';
      let commentData = 'message=' + encodeURIComponent(commentText.value) + '&left=' + encodeURIComponent(x) +
        '&top=' + encodeURIComponent(y);
      let start = wsConnection.url.indexOf('pic/');
      let pic = wsConnection.url.substring(start + 4);
      console.log(pic);
      commentText.value = '';
      fetch(`https://neto-api.herokuapp.com/pic/${pic}/comments`, {
          body: commentData,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .catch(showError);
    }
  })
}

function createNewCommentText(commentId, time, text) {
  Array.from(app.querySelectorAll('.comments__form')).forEach(item => {
    if (item.dataset.commentId === commentId) {
      const commentText = createElement(newComment);
      const commentTime = new Date(time);
      const lastComment = item.querySelector('.loader').parentElement;
      const commentsArea = item.querySelector('.comments__body');
      commentText.firstElementChild.innerText = commentTime.toLocaleString('ru-RU');
      commentText.lastElementChild.innerText = text;
      commentsArea.insertBefore(commentText, lastComment);
      item.querySelector('.loader').style.display = 'none';
    }
  })
}

function drawingMask() {
  menu.dataset.state = 'selected';
  drawMenu.dataset.state = 'selected';

  let drawColor = drawMenu.nextElementSibling.querySelector('[checked]').getAttribute('value');

  Array.from(drawMenu.nextElementSibling.children).forEach(item => {

    item.addEventListener('change', () => {
      Array.from(drawMenu.nextElementSibling.children).forEach(item => {
        item.removeAttribute('checked');
      })
      item.setAttribute('checked', '');
      drawColor = item.getAttribute('value');
    })
  })

  function drawCreate(x, y) {

    ctx.strokeStyle = drawColor;
    ctx.fillStyle = drawColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  drawArea.addEventListener("mousedown", (event) => {
    event.preventDefault();
    if (drawMenu.dataset.state === 'selected') {
      drawing = true;
      ctx.beginPath();
      ctx.moveTo(event.offsetX, event.offsetY);
    }
  });

  drawArea.addEventListener("mouseup", event => {
    event.stopPropagation();
    drawing = false;
    if (drawMenu.dataset.state === 'selected') {
      sendMask();
    }
  });

  drawArea.addEventListener("mouseleave", () => {
    drawing = false;
  });

  drawArea.addEventListener("mousemove", (event) => {
    event.preventDefault();
    if (drawing) {
      drawCreate(event.offsetX, event.offsetY);
    }
  });
}

function wsConnect(id) {
  wsConnection = new WebSocket(`wss://neto-api.herokuapp.com/pic/${id}`);
  wsConnection.addEventListener('message', event => {
    let wsData = JSON.parse(event.data);
    console.log(wsData);
    if (wsData.event === 'mask') {
      updateMask(wsData.url);
    } else {

    }
    if (wsData.event === 'error') {
      console.log(wsData);
    }
    if (wsData.event === 'comment') {
      loadComments({
        "comment": wsData.comment
      });
    }
    if (wsData.event === 'pic') {
      sessionStorage.backgroundId = wsData.pic.id;
      //удаление примера чата комментария
      if (document.querySelector('.comments__form')) {
        document.querySelector('.comments__form').parentNode
          .removeChild(document.querySelector('.comments__form'));
      }
      background.src = wsData.pic.url;
      background.addEventListener('load', () => {
        //добавляем размеры и позицию канвасу
        drawArea.width = background.offsetWidth;
        drawArea.height = background.offsetHeight;
        drawArea.style.cssText = 'position: absolute; \
          top: 50%; \
          left: 50%; \
          transform: translate(-50%, -50%); \
          z-index: 2;'
        //позиционирование контейнера форм
        formContainer.style.cssText = `position: relative; \
          top: 50%; \
          left: 50%; \
          transform: translate(-50%, -50%); \
          width: ${background.offsetWidth}px; \
          height: ${background.offsetHeight}px; \
          z-index: 3;`
        //скрытие прелоадера
        document.querySelector('.image-loader').style.display = 'none';
        menu.style.display = '';
        app.insertBefore(drawArea, background);
        //проверка позиции меню
        if (menu.offsetHeight > menuHeight) {
          checkWidth(menu, menu.offsetLeft);
        }
      })
      if (wsData.pic.mask !== undefined) {
        updateMask(wsData.pic.mask);
      }
      if (wsData.pic.comments !== undefined) {
        loadComments(wsData.pic.comments);
      }
    }
  })
}

function sendMask() {
  drawArea.toBlob(blob => {
    wsConnection.send(blob);
  })
}

function updateMask(url) {
  if (!mask.src) {
    mask.style.cssText = 'position: absolute; \
    top: 50%; \
    left: 50%; \
    transform: translate(-50%, -50%); \
    z-index: 1;';
    app.insertBefore(mask, background);
  }
  mask.src = url;
  mask.addEventListener('load', clearCanvas);
}

function clearCanvas() {
  ctx.clearRect(0, 0, drawArea.width, drawArea.height);
  mask.removeEventListener('load', clearCanvas);
}

function getUrlId() {
  let startId = window.location.href.indexOf('?');
  let backgroundUrl = {};
  backgroundUrl.id = window.location.href.substring(startId + 1);

  if (startId >= 0 && backgroundUrl.id.length > 1) {
    return backgroundUrl;
  } else {
    return false
  };
}

// ~~~~~~~~~~ events ~~~~~~~~~~ //
//загрузка страницы
document.addEventListener('DOMContentLoaded', () => {
  //создание контейнера для комментариев
  app.appendChild(formContainer);
  //удаление примера чата комментария
  document.querySelector('.comments__form').parentNode
    .removeChild(document.querySelector('.comments__form'));
  //установка позиции меню
  menuPositionCalc(menu);
  //удаление ссылки на фон
  background.removeAttribute('src');
  //вставка инпута в меню
  const newInputImage = {
    name: 'label',
    attributes: {
      'class': "menu__item"
    },
    childs: [{
        name: 'i',
        attributes: {
          'class': "menu__icon new-icon"
        }
      },
      {
        name: 'span',
        attributes: {
          'class': "menu__item-title"
        },
        childs: ['Загрузить',
          {
            name: 'br'
          },
          'новое'
        ]
      },
      {
        name: 'input',
        attributes: {
          'type': "file",
          'style': "display: none;",
          'accept': "image/jpeg, image/pjpeg, image/png"
        }
      }
    ]
  }

  inputImage.innerText = '';
  inputImage.style.padding = 0;
  inputImage.appendChild(createElement(newInputImage));


  //загрузка нового фона по событию "Загрузки"
  const inputNewImage = document.querySelector('.menu__item.new input');

  inputNewImage.addEventListener('change', event => {
    event.preventDefault();
    const [file] = event.currentTarget.files;
    loadBackground(file);
  });

  //Проверка ссылки, попытка загрузки с сервера
  let shareUrl = getUrlId() ? getUrlId().id : sessionStorage.backgroundId;
  if (shareUrl) {
    fetch(`https://neto-api.herokuapp.com/pic/${shareUrl}`)
      .then(data => {
        return data.json();
      })
      .then(data => {
        document.querySelector('.menu__url').setAttribute('value', `${mainPath}?${data.id}`);
        wsConnect(data.id);
        if (getUrlId()) {
          toCommentsMenu();
        } else {
          shareImage();
        }
      })
      .catch(data => {
        showError('Изображение по ссылке не найдено');
        startingApp();
      })

  } else {
    startingApp();
  }
})

//загрузка файла переносом
app.addEventListener('dragover', event => event.preventDefault());

app.addEventListener('drop', event => {
  event.preventDefault();
  if (background.src) {
    showError('Чтобы загрузить новое изображение, пожалуйста воспользуйтесь пунктом "Загрузить новое" в меню')
    return;
  }
  const [file] = event.dataTransfer.files;
  console.log(file);
  loadBackground(file);
})

//перетаскивание меню
menu.firstElementChild.addEventListener('mousedown', event => {
  dragMenu = event.currentTarget;
})

document.addEventListener('mousemove', event => {
  if (dragMenu) {
    event.preventDefault();
    if (event.pageX - dragMenu.offsetWidth / 2 < 0) {
      menu.style.setProperty('--menu-left', 0 + 'px')
      localStorage.menuLeft = 0;
    } else if (event.pageX + menu.offsetWidth > document.documentElement.clientWidth - dragMenu.offsetWidth / 2) {
      menu.style.setProperty('--menu-left', document.documentElement.clientWidth - menu.offsetWidth - 1 + 'px');
      localStorage.menuLeft = document.documentElement.clientWidth - menu.offsetWidth - 1;
    } else {
      menu.style.setProperty('--menu-left', event.pageX - dragMenu.offsetWidth / 2 + 'px');
      localStorage.menuLeft = event.pageX - dragMenu.offsetWidth / 2;
    }
    if (event.pageY - dragMenu.offsetHeight / 2 < 0) {
      menu.style.setProperty('--menu-top', 0 + 'px')
      localStorage.menuTop = 0;
    } else if (event.pageY + menu.offsetHeight > document.documentElement.clientHeight - dragMenu.offsetWidth / 2) {
      menu.style.setProperty('--menu-top', document.documentElement.clientHeight - menu.offsetHeight + 'px');
      localStorage.menuTop = document.documentElement.clientHeight - menu.offsetHeight;
    } else {
      menu.style.setProperty('--menu-top', event.pageY - dragMenu.offsetHeight / 2 + 'px');
      localStorage.menuTop = event.pageY - dragMenu.offsetHeight / 2;
    }
  }
})

document.addEventListener('mouseup', event => {
  if (dragMenu) {
    dragMenu = null;
  }
});

//клики меню
menu.addEventListener('click', event => {
  formContainer.style.zIndex = '';
  if (event.target === burgerMenu || event.target.parentNode === burgerMenu) {
    Array.from(menu.children).forEach(item => {
      item.dataset.state = '';
    })
    menu.dataset.state = 'default';
  }

  if (event.target === shareMenu || event.target.parentNode === shareMenu) {
    Array.from(menu.children).forEach(item => {
      item.dataset.state = '';
    })
    shareImage();
  }

  if (event.target === drawMenu || event.target.parentNode === drawMenu) {
    Array.from(menu.children).forEach(item => {
      item.dataset.state = '';
    })
    drawingMask();
  }

  if (event.target === commentsMenu || event.target.parentNode === commentsMenu) {
    toCommentsMenu();
  }
  menuPositionCalc(menu);
})

//создание комментариев
formContainer.addEventListener('click', event => {
  if (event.target === event.currentTarget && commentsMenu.dataset.state === 'selected' && commentsToggle[0].hasAttribute('checked')) {
    closeComments();
    let formX = event.pageX - (drawArea.offsetLeft - drawArea.offsetWidth / 2);
    let formY = event.pageY - (drawArea.offsetTop - drawArea.offsetHeight / 2);
    createNewCommentBlock(formX, formY);
  }
})

//копирование ссылки
document.querySelector('.menu_copy').addEventListener('click', event => {
  menu.querySelector('.menu__url').select();
  try {
    let successful = document.execCommand('copy');
    let msg = successful ? 'успешно ' : 'не';
    console.log(`URL ${msg} скопирован`);
  } catch (err) {
    console.log('Ошибка копирования');
  }
  window.getSelection().removeAllRanges();
})