/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronRight, Globe, MapPin, Plus, Sparkles, Users, X } from 'lucide-react';
import { getVets, follow, getMeId, getRequests, acceptRequest, rejectRequest } from '../api';
import './peopleToKnow.css';

export default function FeedRail({ onCreate, onExplore }) {
  const navigate = useNavigate();
  const meId = getMeId();
  const [people, setPeople] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getVets(meId)
      .then(list =>
        setPeople(list.filter(v => v.id !== meId && !v.following && !v.requested).slice(0, 3))
      )
      .catch(() => setPeople([]));

    if (meId) {
      getRequests(meId)
        .then(setRequests)
        .catch(() => setRequests([]));
    }
  }, []);

  const addPerson = async vet => {
    if (!meId) {
      window.alert('Create your professional page first.');
      return;
    }
    try {
      await follow(vet.id, meId);
      setPeople(people.filter(p => p.id !== vet.id));
    } catch (error) {
      window.alert(error.message);
    }
  };

  const answer = async (vet, accepted) => {
    try {
      if (accepted) {
        await acceptRequest(meId, vet.id);
      } else {
        await rejectRequest(meId, vet.id);
      }
      setRequests(requests.filter(r => r.id !== vet.id));
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <aside className="zv-rail">
      {requests.length > 0 && (
        <>
          <div className="zv-rail-head">
            <span>FOLLOW REQUESTS</span>
          </div>

          {requests.map(vet => (
            <div className="pk-row" key={vet.id}>
              <img className="pk-photo" src={vet.image} alt="" onClick={() => navigate('/profile/' + vet.slug)} />
              <div className="pk-info" onClick={() => navigate('/profile/' + vet.slug)}>
                <span className="pk-name">{vet.name}</span>
                <span className="pk-specialty">{vet.specialty}</span>
              </div>
              <button className="pk-accept" aria-label={'Accept ' + vet.name} onClick={() => answer(vet, true)}>
                <Check size={14} />
              </button>
              <button className="pk-reject" aria-label={'Reject ' + vet.name} onClick={() => answer(vet, false)}>
                <X size={14} />
              </button>
            </div>
          ))}

          <hr className="zv-rail-divider" />
        </>
      )}

      <div className="zv-rail-head">
        <span>PEOPLE TO KNOW</span>
        <button className="zv-rail-link" onClick={() => navigate('/network')}>
          View all <ArrowUpRight size={12} />
        </button>
      </div>

      {people.length === 0 && <p className="zv-rail-empty">You are following everyone for now.</p>}

      {people.map(vet => (
        <div className="pk-row" key={vet.id}>
          <img className="pk-photo" src={vet.image} alt="" onClick={() => navigate('/profile/' + vet.slug)} />
          <div className="pk-info" onClick={() => navigate('/profile/' + vet.slug)}>
            <span className="pk-name">{vet.name}</span>
            <span className="pk-specialty">{vet.specialty}</span>
            <span className="pk-city">
              <MapPin size={11} /> {vet.city}
            </span>
          </div>
          <button className="pk-plus" aria-label={'Follow ' + vet.name} onClick={() => addPerson(vet)}>
            <Plus size={14} />
          </button>
        </div>
      ))}

      <hr className="zv-rail-divider" />

      <div className="zv-rail-head">
        <span>THE ZENVE ADVANTAGE</span>
        <Sparkles size={15} />
      </div>

      <button className="zv-advantage" onClick={onCreate}>
        <span className="zv-advantage-icon">
          <Globe size={18} />
        </span>
        <span className="zv-advantage-text">
          <b>Your own professional page</b>
          <small>A place for your work, your voice, your professional identity.</small>
        </span>
        <ChevronRight size={16} />
      </button>

      <button className="zv-advantage" onClick={onExplore}>
        <span className="zv-advantage-icon">
          <Users size={18} />
        </span>
        <span className="zv-advantage-text">
          <b>Meaningful connections</b>
          <small>Discover peers beyond your clinic and your city.</small>
        </span>
        <ChevronRight size={16} />
      </button>
    </aside>
  );
}