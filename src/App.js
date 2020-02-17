import React, {useState, useEffect} from 'react';
import connect from '@vkontakte/vk-connect';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';
import './App.css'
import Epic from "@vkontakte/vkui/dist/components/Epic/Epic";
import Tabbar from '@vkontakte/vkui/dist/components/Tabbar/Tabbar';
import TabbarItem from '@vkontakte/vkui/dist/components/TabbarItem/TabbarItem';
import Icon28Newsfeed from '@vkontakte/icons/dist/28/newsfeed';
import Icon28More from '@vkontakte/icons/dist/28/more';
import Icon24Camera from '@vkontakte/icons/dist/24/camera';
import Posts from "./panels/Posts";
import PhotoPreview from "./panels/PhotoPreview";
import ModalCard from "@vkontakte/vkui/dist/components/ModalCard/ModalCard";
import ModalRoot from "@vkontakte/vkui/dist/components/ModalRoot/ModalRoot";
import Avatar from "@vkontakte/vkui/dist/components/Avatar/Avatar";
import Textarea from "@vkontakte/vkui/dist/components/Textarea/Textarea";
import File from "@vkontakte/vkui/dist/components/File/File";
import Div from '@vkontakte/vkui/dist/components/Div/Div';
import Button from "@vkontakte/vkui/dist/components/Button/Button";
import vkConnectPromise from '@vkontakte/vk-connect-promise';
import Catalog from "./panels/Сatalog";


let userId = 0;
let access_token_photo_glob = 0;
let app_id = 7138591
let albumIdForPhoto
let imgGlob
let imgForMessage
let sendMessage
let offset = 30
let fetching = true

const App = () => {
    const [activeView, setActiveView] = useState('post');
    const [activePanel, setActivePanel] = useState('home');
    const [fetchedUser, setUser] = useState(null);
    const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
    const [userArr, setUserArr] = useState([])
    const [lang, setLang] = useState('ru')
    const [postArr, setPostArr] = useState([])
    const [photo, setPhoto] = useState('')
    const [activeModal, setActiveModal] = useState('subscription')
    const [checkMessage, setcheckMessage] = useState(false)
    const [img, setImg] = useState(null)
    const [message, setMessage] = useState('')
    const [access_token_photo, setAccess_token_photo] = useState(0)
    const [groupInfo, setGroupInfo] = useState(null)


    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setLang(urlParams.get('vk_language' || "ru"))
        connect.subscribe(({detail: {type, data}}) => {
            switch (type) {
                case 'VKWebAppUpdateConfig':
                    const schemeAttribute = document.createAttribute('scheme');
                    schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
                    document.body.attributes.setNamedItem(schemeAttribute);
                    break;
                case 'VKWebAppAllowMessagesFromGroupResult':
                    setPopout(null)
                    isMessagesFromGroupAllowed()
                    break;
                case 'VKWebAppAllowMessagesFromGroupFailed':
                    setPopout(null)
                    isMessagesFromGroupAllowed()
                    break;
                case 'VKWebAppAccessTokenReceived':
                    if (access_token_photo === 0) {
                        setAccess_token_photo(data.access_token)
                        access_token_photo_glob = data.access_token
                        getAlbum(userId, data.access_token)
                    }
                    break;
                case 'VKWebAppCallAPIMethodResult':
                    switch (data.request_id) {
                        case 'getUsers':
                            setPopout(null)
                            setUserArr(data.response)
                            break;
                        case 'getPosts':
                            setPopout(null)
                            setPostArr(postArr.concat(data.response.items))
                            break;
                        case 'checkMessage':
                            setPopout(null)
                            data.response.is_allowed === 0 ? setcheckMessage(false) : setcheckMessage(true)
                            break;
                        case 'userAlbums':
                            const find = "Мои рисунки, наброски";
                            const group = data.response.items
                            if (data.response.count === 0) {
                                createAlbum(find, find, access_token_photo_glob)
                            } else if (group.find(x => x.title === find) === undefined) {
                                createAlbum(find, find, access_token_photo_glob)
                            } else {
                                let albumId = group.find(x => x.title === find).id
                                albumIdForPhoto = albumId
                                postPhotoUrl(albumId, access_token_photo_glob)
                            }
                            break;
                        case 'createAlbum':
                            albumIdForPhoto = data.response.id
                            postPhotoUrl(data.response.id, access_token_photo_glob)
                            break;
                        case 'photoUrl':
                            postPhoto(data.response.upload_url, imgGlob, access_token_photo_glob, data.response.album_id)
                            break;
                        case 'photoSave':
                            imgForMessage = `photo${data.response[0].group_id}_${data.response[0].id}`
                            createMessage()
                            break;
                        case 'sendWall':
                            setPopout(null);
                            setActiveModal("sendResult")
                            setMessage('')
                            setImg(null)
                            break;
                        case 'getGroup':
                            setPopout(null);
                            setGroupInfo(data.response[0])
                            break;
                        default:
                            console.log(type)
                    }
                    break;
                default:
                    console.log(type);
            }
        });

        async function fetchData() {
            const user = await connect.send('VKWebAppGetUserInfo');
            setUser(user);
            userId = user.id
            setPopout(null);
        }

        fetchData();
        getPosts()
        getGroupInfo()
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleScroll = (e) => {
        let currentScroll = e.currentTarget.scrollY;
        let innerHeight = window.innerHeight;
        let scrollHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        if (innerHeight + currentScroll > scrollHeight * 0.95 && fetching && innerHeight + 1000 < currentScroll) {
            fetching = false;
            getPostsAdd()
        }
    };


    const addGroup = () => {
        connect.send("VKWebAppJoinGroup", {"group_id": +group_id});
    }

    const go = e => {
        setActivePanel(e.currentTarget.dataset.to);
    };

    const showPhoto = (photo) => {
        setPhoto(photo)
        setActivePanel('photo')
    }

    const getPostsAdd = async () => {
        setPopout(<ScreenSpinner size='large'/>)
        vkConnectPromise
            .send("VKWebAppCallAPIMethod", {
                "method": "wall.get",
                "request_id": "getPostsAdd",
                "params": {
                    "filters": 'post',
                    "owner_id": `-${group_id}`,
                    "count": 50,
                    "v": "5.105",
                    "access_token": service_token,
                    'lang': lang,
                    'offset': offset
                }
            })
            .then(data => {
                setPostArr(postArr.concat(data.response.items))
                offset = offset + 30
                setPopout(null);
                setTimeout(() => fetching = true, 4000);
            })
            .catch(error => {
                // Handling an error
            });

    }

    const getPosts = () => {
        connect.send("VKWebAppCallAPIMethod", {
            "method": "wall.get",
            "request_id": "getPosts",
            "params": {
                "filters": 'post',
                "owner_id": `-${group_id}`,
                "count": 30,
                "v": "5.105",
                "access_token": service_token,
                'lang': lang
            }
        });
    }

    const getGroupInfo = () => {
        connect.send("VKWebAppCallAPIMethod", {
            "method": "groups.getById",
            "request_id": "getGroup",
            "params": {
                "fields": 'description',
                "group_ids": `${group_id}`,
                "v": "5.105",
                "access_token": service_token,
                'lang': lang
            }
        });
    }

    const isMessagesFromGroupAllowed = () => {
        connect.send("VKWebAppCallAPIMethod", {
            "method": "messages.isMessagesFromGroupAllowed",
            "request_id": "checkMessage",
            "params": {
                "user_id": userId,
                "group_id": group_id,
                "v": "5.105",
                "access_token": group_token,
            }
        });
    }

    const sendPost = () => {
        setActiveModal(null)
        setPopout(<ScreenSpinner size='large'/>)
        if (img === null) {
            createMessage()
        } else {
            gerTokenUser()
        }
    };

    const createMessage = () => {
        let attachments = `${imgForMessage}`;
        //сгенерированный guid
        let guid = Math.floor(1000000000 + Math.random() * (9000000000 + 1 - 1000000000));
        let data = +new Date();
        let postData = Math.round(data/1000)+86400;
        connect.send("VKWebAppCallAPIMethod", {
            "method": "wall.post", "request_id": "sendWall", "params": {
                "owner_id": `-${group_id}`,
                "from_group": "1",
                "signed": "0",
                "message": sendMessage,
                "attachments": attachments,
                "publish_date": +postData,
                "guid": guid,
                "v": "5.103",
                "access_token": token_admin
            }
        });
    }

    const modal = (
        <ModalRoot activeModal={activeModal}>
            <ModalCard
                id='subscription'
                onClose={() => setActiveModal(null)}
                icon={<Avatar src={groupInfo && groupInfo.photo_50} size={72}/>}
                caption={<span><h1>{groupInfo && groupInfo.name}</h1>Мини приложение предлагает Вам <br/> подписаться на сообщество</span>}
                actions={[{
                    title: 'Подписаться',
                    mode: 'primary',
                    action: () => {
                        addGroup()
                        setActiveModal(null)
                    }
                }]}
                actionsLayout="vertical"
            >
            </ModalCard>
            <ModalCard
                id='sendPost'
                onClose={() => setActiveModal(null)}
            >
                <Div>
                    <h1>Предложить новость</h1>
                    <Textarea className='margin-bottom' value={message} onChange={(e) => {
                        setMessage(e.currentTarget.value)
                        sendMessage = e.currentTarget.value
                    }} placeholder='Введите текст новости'/>
                    <File top="Загрузите картинку" className='margin-bottom' before={<Icon24Camera/>} size="l"
                          onChange={(e) => {
                              let file = e.currentTarget.files[0]
                              imgGlob = e.currentTarget.files[0]
                              const reader = new FileReader();
                              reader.readAsDataURL(file)
                              reader.onloadend = () => {
                                  setImg(reader.result)
                              }
                          }}>
                        Прикрепить картинку
                    </File>
                    {img && <img className='margin-bottom modal-img' src={img} alt='img'/>}
                    <Button mode="secondary" size="xl" disabled={!message} onClick={() => sendPost()}>Отправить</Button>
                </Div>
            </ModalCard>
            <ModalCard
                id='sendResult'
                onClose={() => setActiveModal(null)}
                actions={[
                    {
                        title: 'Отлично!',
                        mode: 'primary',
                        action: () => {
                            setActiveModal(null)
                        }
                    }
                ]}
            >
                <Div>
                    <h1>Новость успешно отправлена!</h1>
                </Div>
            </ModalCard>
        </ModalRoot>
    );

    //получение ссылки на загрузку фотки
    const postPhotoUrl = (album_id, newToken) => {
        connect.send("VKWebAppCallAPIMethod", {
            "method": "photos.getUploadServer", "request_id": "photoUrl", "params": {
                "album_id": album_id,
                "v": "5.103", "access_token": newToken
            }
        });
    };

    //отправка фотки на сервер
    const postPhoto = (url, photo, newToken, album_id) => {
        let formData = new FormData();
        formData.append('photo', photo);
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        fetch(proxyurl + url, {
            method: 'POST',
            body: formData,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                if (data) {
                    savePhoto(data.server, data.photos_list, data.hash, newToken, album_id);
                } else {
                    // proccess server errors
                }
            })
            .catch(function (error) {
                // proccess network errors
            });
    };


    //сохранение фотки
    const savePhoto = (server, photos_list, hash, newToken, album_id) => {
        connect.send("VKWebAppCallAPIMethod", {
            "method": "photos.save", "request_id": "photoSave", "params": {
                "album_id": album_id,
                "server": server,
                "photos_list": photos_list,
                "hash": hash,
                "v": "5.101",
                "access_token": newToken
            }
        });
    };


    //получение списка альбомов пользователя
    const getAlbum = (id, nToken) => {
        connect.send("VKWebAppCallAPIMethod", {
            "method": "photos.getAlbums", "request_id": "userAlbums", "params": {
                "owner_id": id, "v": "5.103", "access_token": nToken
            }
        });
    }

    //создание албома если его нет
    const createAlbum = (title, description, nToken) => {
        connect.send("VKWebAppCallAPIMethod", {
            "method": "photos.createAlbum", "request_id": "createAlbum", "params": {
                "title": title, "description": description, "v": "5.103", "access_token": nToken
            }
        });
    }

    //получение токена на работу с фото
    const gerTokenUser = () => {
        connect.send("VKWebAppGetAuthToken", {"app_id": app_id, "scope": "photos"});
    }

    return (
        <Epic activeStory={activeView} tabbar={
            <Tabbar>
                <TabbarItem
                    onClick={() => setActiveView('post')}
                    selected={activeView === 'post'}
                    // text="Новости"
                ><Icon28Newsfeed/></TabbarItem>
                <TabbarItem
                    onClick={() => setActiveView('catalog')}
                    selected={activeView === 'catalog'}
                    // text="Каталог художников"
                ><Icon28More/></TabbarItem>
            </Tabbar>
        }>
            <View activePanel={activePanel} popout={popout} id="post" modal={modal}>
                <Posts id='home' fetchedUser={fetchedUser} go={go} setPopout={setPopout} lang={lang} postArr={postArr}
                       offset={offset} groupInfo={groupInfo}
                       showPhoto={showPhoto} getPosts={getPosts} setActiveModal={setActiveModal}/>
                <PhotoPreview id='photo' go={go} photo={photo}/>
            </View>
            <View activePanel={'people'} popout={popout} id="catalog">
                <Catalog setPopout={setPopout} id='people' fetchedUser={fetchedUser} go={go}
                         userArr={userArr} lang={lang} checkMessage={checkMessage} setcheckMessage={setcheckMessage}
                         isMessagesFromGroupAllowed={isMessagesFromGroupAllowed}/>
            </View>
        </Epic>
    );
}

export default App;

