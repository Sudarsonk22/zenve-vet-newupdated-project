
import { Link } from 'react-router-dom';
import Avatar from '../../../components/common/Avatar';
import Icon from '../../../components/common/Icon';
import { appRoutes } from '../../../config/appRoutes';
import '../styles/CommunityWidgets.css';

export function StoriesBar({ stories, onOpen }) {
  return (
    <section className="storiesBar" aria-label="Community stories">
      <div className="storiesHeading">
        <h2>Moments from the community</h2>
        <span>STORIES</span>
      </div>

      <div className="storiesRail">
        {stories.map((story) => (
          <button
            type="button"
            className="storyBubble"
            key={story.id}
            onClick={() => onOpen(story)}
          >
            <span className="storyRing">
              <img src={story.image} alt="" />
            </span>
            <span>{story.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function StoryViewer({ story, onClose }) {
  if (!story) return null;

  return (
    <div
      className="storyModal"
      role="dialog"
      aria-modal="true"
      aria-label={`${story.name}'s story`}
      onClick={onClose}
    >
      <article
        className="storyViewer"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={story.image} alt="" />
        <div className="storyShade" />

        <button
          type="button"
          className="storyClose"
          onClick={onClose}
          aria-label="Close story"
        >
          <Icon name="close" />
        </button>

        <Link
          to={`/professional/${story.creator.id}`}
          className="storyAuthor"
          onClick={onClose}
        >
          <Avatar
            src={story.creator.avatarUrl}
            name={story.creator.name}
            size={40}
          />
          <strong>{story.creator.name}</strong>
        </Link>

        <div className="storyCopy">
          <span>COMMUNITY STORY</span>
          <h2>{story.title}</h2>
          <p>{story.text}</p>
        </div>
      </article>
    </div>
  );
}

export function PeopleSuggestions({ people }) {
  return (
    <aside className="communityAside">
      <div className="asideTitle">
        <span>PEOPLE TO KNOW</span>
        <Link to={appRoutes.search}>View all</Link>
      </div>

      {people.slice(0, 3).map((person) => (
        <Link
          className="suggestedPerson"
          to={`/professional/${person.id}`}
          key={person.id}
        >
          <Avatar
            src={person.avatarUrl}
            name={person.name}
            size={40}
          />

          <span>
            <strong>{person.name}</strong>
            <small>{person.specialization}</small>
            <small>
              <Icon name="mapPin" size={12} /> {person.city}
            </small>
          </span>

          <b>+</b>
        </Link>
      ))}

      <div className="advantage">
        <div className="asideTitle">
          <span>THE ZENVE ADVANTAGE</span>
          <Icon name="sparkles" size={20} />
        </div>

        {[
          {
            id: 'professional-page',
            icon: 'user',
            title: 'Your own professional page',
            text: 'A place for your work, your voice, your professional identity.',
          },
          {
            id: 'connections',
            icon: 'users',
            title: 'Meaningful connections',
            text: 'Discover peers beyond your clinic and your city.',
          },
          {
            id: 'growth',
            icon: 'briefcase',
            title: 'Grow with possibility',
            text: 'Mentorship, research and innovation pathways.',
          },
        ].map((item) => (
          <Link
            key={item.id}
            to={appRoutes.advantage(item.id)}
            className="advantageItem"
          >
            <i><Icon name={item.icon} /></i>
            <span>
              <strong>{item.title}</strong>
              <small>{item.text}</small>
            </span>
            <Icon name="chevronRight" />
          </Link>
        ))}
      </div>
    </aside>
  );
}
