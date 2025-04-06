import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TokenDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newOwner, setNewOwner] = useState('');
    const [updatePrice, setUpdatePrice] = useState('');
    const [updating, setUpdating] = useState(false);
    const [transferring, setTransferring] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/tokens/${id}`);
                setToken(response.data);
                setUpdatePrice(response.data.price);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch token details');
                setLoading(false);
            }
        };

        fetchToken();
    }, [id]);

    const toggleForSale = async () => {
        try {
            setUpdating(true);
            await axios.put(`http://localhost:3000/api/tokens/${id}`, {
                forSale: !token.forSale,
                price: parseFloat(updatePrice)
            });

            // Refresh token data
            const response = await axios.get(`http://localhost:3000/api/tokens/${id}`);
            setToken(response.data);
            setUpdating(false);
        } catch (err) {
            setError('Failed to update token');
            setUpdating(false);
        }
    };

    const handleTransfer = async () => {
        if (!newOwner) {
            setError('Please enter a new owner');
            return;
        }

        try {
            setTransferring(true);
            await axios.post(`http://localhost:3000/api/tokens/${id}/transfer`, {
                newOwner
            });

            setShowModal(false);

            // Refresh token data
            const response = await axios.get(`http://localhost:3000/api/tokens/${id}`);
            setToken(response.data);
            setTransferring(false);
            setNewOwner('');
        } catch (err) {
            setError('Failed to transfer token');
            setTransferring(false);
        }
    };

    if (loading) return <div className="text-center my-5"><h3>Loading token details...</h3></div>;

    if (error) return <Alert variant="danger">{error}</Alert>;

    if (!token) return <Alert variant="warning">Token not found</Alert>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Token Details: {token.id}</h1>
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>Back</Button>
            </div>

            <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <div>
                        <span className={`source-icon ${token.sourceType}`}>
                            {getSourceIcon(token.sourceType)}
                        </span>
                        <span className="ms-2">{capitalizeFirstLetter(token.sourceType)} Energy Token</span>
                    </div>
                    <div>
                        {token.forSale && <Badge bg="success">For Sale</Badge>}
                        {token.certifiedGreen && <Badge bg="info" className="ms-2">Green Certified</Badge>}
                    </div>
                </Card.Header>
                <Card.Body>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <h5>Token Information</h5>
                            <p><strong>Token ID:</strong> {token.id}</p>
                            <p><strong>Energy Amount:</strong> {token.energyAmount} kWh</p>
                            <p><strong>Created At:</strong> {new Date(token.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="col-md-6 mb-3">
                            <h5>Ownership Information</h5>
                            <p><strong>Current Owner:</strong> {token.owner}</p>
                            <p><strong>Producer:</strong> {token.producer}</p>
                            <p><strong>Current Price:</strong> ${token.price}</p>
                        </div>
                    </div>

                    <div className="mt-3">
                        <h5>Update Price</h5>
                        <div className="d-flex align-items-center">
                            <div className="input-group" style={{ maxWidth: '200px' }}>
                                <span className="input-group-text">$</span>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={updatePrice}
                                    onChange={(e) => setUpdatePrice(e.target.value)}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>
                </Card.Body>
                <Card.Footer>
                    <Button
                        variant={token.forSale ? "warning" : "success"}
                        onClick={toggleForSale}
                        disabled={updating}
                        className="me-2"
                    >
                        {updating ? "Updating..." : (token.forSale ? "Remove From Sale" : "Mark For Sale")}
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => setShowModal(true)}
                        disabled={transferring}
                    >
                        {transferring ? "Transferring..." : "Transfer Token"}
                    </Button>
                </Card.Footer>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Transfer Token</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>New Owner</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter user ID of new owner"
                                value={newOwner}
                                onChange={(e) => setNewOwner(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleTransfer}
                        disabled={transferring}
                    >
                        {transferring ? "Transferring..." : "Transfer Token"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

// Helper function to get icon for energy source
function getSourceIcon(source) {
    switch (source) {
        case 'solar':
            return '☀️';
        case 'wind':
            return '🌬️';
        case 'hydro':
            return '💧';
        case 'biomass':
            return '🌱';
        case 'geothermal':
            return '🔥';
        default:
            return '⚡';
    }
}

// Helper function to capitalize
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default TokenDetails;