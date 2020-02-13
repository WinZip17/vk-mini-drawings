import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Button from '@vkontakte/vkui/dist/components/Button/Button';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Div from '@vkontakte/vkui/dist/components/Div/Div';
import Separator from '@vkontakte/vkui/dist/components/Separator/Separator';
import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import moment from "moment";
import Icon24CommentOutline from '@vkontakte/icons/dist/24/comment_outline';
import FixedLayout from "@vkontakte/vkui/dist/components/FixedLayout/FixedLayout";
import Icon24OpenIn from '@vkontakte/icons/dist/24/open_in';


const Posts = ({ id, postArr,  showPhoto, setActiveModal }) => {

	useEffect(() => {
	}, []);


	const getDate = (date) => {
		return moment(date*1000).format('DD.MM.YYYY  h:mm')
	}

	const getPhotoArr = (arrDoc) => {
		let photoArr = []
		for (let i = 0; i < arrDoc.length; i++) {
			if (arrDoc[i].type === "photo") {
				photoArr.push(arrDoc[i].photo)
			}
		}
		return photoArr
	}

	return <Panel id={id}>
		<PanelHeader>Лента</PanelHeader>
		{postArr.length > 0 && postArr.map((p) => {
			if (!p.is_pinned) {
				return <Group key={p.id}>
					<Div>
						<Cell
							before={<Avatar  src="https://sun1-25.userapi.com/c857616/v857616788/170f9b/EKExqwLJWgs.jpg" size={48}></Avatar>}
							description={getDate(p.date)}
						>
							<a className='text-decor-none' target='_blank' href='https://vk.com/moiresunke'>Мои рисунки, наброски | Бот</a>
						</Cell>
						{p.text}
						{getPhotoArr(p.attachments).length > 0 && <Div ><div className='photo-shell'>{getPhotoArr(p.attachments).map((p) => {
							let lastItem = p.sizes.length - 1
							// return <a key={p.id} href={p.sizes[lastItem].url}><img src={p.sizes[lastItem].url} alt={'img'} /></a>
							return <div className='photo-div' key={p.id}><img key={p.id} className='photo-post' src={p.sizes[lastItem].url} alt={'img'} onClick={() => showPhoto(p.sizes[lastItem].url)} /></div>
						})}</div>
							<Separator wide />
							<Button mode="secondary" className='fix-margin-icon' target='_blank' href={`https://vk.com/moiresunke?w=wall${p.owner_id}_${p.id}`}>Обсудить</Button>
							{/*<a target='_blank' href={`https://vk.com/moiresunke?w=wall${p.owner_id}_${p.id}`} > <Icon24CommentOutline className='fix-margin-icon'/></a>*/}
						</Div>
						}
						<FixedLayout vertical="bottom">
								<Button mode="secondary" before={<Icon24OpenIn/>} size="xl" onClick={() => setActiveModal('sendPost')} > Предложить новость </Button>
						</FixedLayout>

					</Div>
				</Group>
			}
		})}
	</Panel>
};

Posts.propTypes = {
	id: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
	fetchedUser: PropTypes.shape({
		photo_200: PropTypes.string,
		first_name: PropTypes.string,
		last_name: PropTypes.string,
		city: PropTypes.shape({
			title: PropTypes.string,
		}),
	}),
};

export default Posts;
