import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import "../styles/RewardsPage.css";

const RewardsPage = () => {
    const [rewards, setRewards] = useState([
        {
            id: 1,
            name: 'Movie Night',
            price: 50,
            image: 'https://wck.org.pl/wp-content/uploads/2025/04/PL_MNCRFT_ONLINE_MASTER_MAIN_4000x2490_INTL-scaled.jpg',
            purchased: false
        },
        {
            id: 2,
            name: 'Ice Cream Treat',
            price: 30,
            image: 'https://pbs.twimg.com/media/E_g87NiWQAQUBH9.jpg',
            purchased: false
        },
        {
            id: 3,
            name: 'New Book',
            price: 100,
            image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            purchased: false
        }
    ]);

    const [newReward, setNewReward] = useState({
        name: '',
        price: '',
        image: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [points, setPoints] = useState(150); // This would come from your global state

    // ✅ Fetch rewards from backend on load
    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const response = await fetch('/api/rewards', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const data = await response.json();
                console.log("📦 Reward fetch response data:", data); // ✅ ADD THIS

                if (!Array.isArray(data)) {
                    console.error("Expected an array but got:", data);
                    return;
                }

                setRewards(data.map(r => ({
                    id: r.id,
                    name: r.title,
                    price: r.points_required,
                    image: '',
                    purchased: false
                })));
            } catch (error) {
                console.error("❌ Failed to fetch rewards", error);
            }
        };

        fetchRewards();
    }, []);


    const handlePurchase = async (rewardId) => {
        const reward = rewards.find(r => r.id === rewardId);

        if (points < reward.price) {
            alert("You don't have enough points for this reward!");
            return;
        }

        try {
            const response = await fetch(`/api/rewards/redeem/${rewardId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Redeem failed:", errorData);
                alert(errorData.message || "Failed to redeem reward.");
                return;
            }

            // Successful redemption
            setPoints(points - reward.price);
            setRewards(rewards.map(r =>
                r.id === rewardId ? { ...r, purchased: true } : r
            ));
        } catch (error) {
            console.error("Error redeeming reward:", error);
            alert("An error occurred while redeeming the reward.");
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewReward({ ...newReward, [name]: value });
    };

    const handleAddReward = async () => {
        console.log("Save Reward clicked", newReward); // Debugging line

        if (!newReward.name || !newReward.price) {
            alert("Please enter both a name and price for the reward.");
            return;
        }

        try {
            const response = await fetch('/api/rewards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: newReward.name,
                    pointsRequired: parseInt(newReward.price)  // <- ✅ Match your backend naming
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to save reward:", errorData);
                alert("Failed to save reward.");
                return;
            }

            const data = await response.json();
            console.log("New reward saved:", data); // Debugging line

            setRewards([...rewards, {
                id: data.id,
                name: data.title,
                price: data.points_required,
                image: newReward.image,
                purchased: false
            }]);

            setNewReward({ name: '', price: '', image: '' });
            setShowAddForm(false);
        } catch (error) {
            console.error("Error adding reward:", error);
            alert("An error occurred while saving the reward.");
        }
    };


    // ✅ Delete reward from backend
    const handleDeleteReward = async (rewardId) => {
        if (window.confirm("Are you sure you want to delete this reward?")) {
            try {
                await fetch(`/api/rewards/${rewardId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setRewards(rewards.filter(reward => reward.id !== rewardId));
            } catch (error) {
                console.error("Error deleting reward:", error);
            }
        }
    };

    return (
        <div className="rewards-container">
            <header>
                <div className="header-left">
                    <h1>Rewards</h1>
                    <div className="points-display">Your Points: {points}</div>
                </div>
                <nav>
                    <Link to="/taskpage" className="nav-button">Tasks</Link>
                    <Link to="/calendar" className="nav-button">Calendar</Link>
                    <Link to="/streaks" className="nav-button">Streaks</Link>
                    <button className="active">Rewards</button>
                    <Link to="/account" className="nav-button">Account</Link>
                </nav>
            </header>

            <div className="rewards-content">
                <div className="rewards-header">
                    <h2>Available Rewards</h2>
                    <button
                        className="add-reward-btn"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? 'Cancel' : '+ Add Reward'}
                    </button>
                </div>

                {showAddForm && (
                    <div className="add-reward-form">
                        <h3>Add New Reward</h3>
                        <input
                            type="text"
                            name="name"
                            value={newReward.name}
                            onChange={handleInputChange}
                            placeholder="Reward Name"
                        />
                        <input
                            type="number"
                            name="price"
                            value={newReward.price}
                            onChange={handleInputChange}
                            placeholder="Points Cost"
                        />
                        <input
                            type="text"
                            name="image"
                            value={newReward.image}
                            onChange={handleInputChange}
                            placeholder="Image URL"
                        />
                        <button onClick={handleAddReward}>Save Reward</button>
                    </div>
                )}

                <div className="rewards-grid">
                    {rewards.map(reward => (
                        <div key={reward.id} className={`reward-card ${reward.purchased ? 'purchased' : ''}`}>
                            <div className="reward-image">
                                <img src={reward.image || 'https://via.placeholder.com/150'} alt={reward.name} />
                                <button
                                    className="delete-reward-btn"
                                    onClick={() => handleDeleteReward(reward.id)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                            <div className="reward-info">
                                <h3>{reward.name}</h3>
                                <div className="reward-price">{reward.price} points</div>
                                {reward.purchased ? (
                                    <div className="purchased-label">Purchased!</div>
                                ) : (
                                    <button
                                        onClick={() => handlePurchase(reward.id)}
                                        disabled={points < reward.price}
                                    >
                                        Purchase
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RewardsPage;
