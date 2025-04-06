import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateToken = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id: '',
        owner: '',
        producer: '',
        energyAmount: '',
        price: '',
        sourceType: '',
        forSale: true,
        certifiedGreen: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Convert string numbers to actual numbers
            const numericFormData = {
                ...formData,
                energyAmount: parseFloat(formData.energyAmount),
                price: parseFloat(formData.price)
            };

            await axios.post('http://localhost:3000/api/tokens', numericFormData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/tokens');
            }, 2000);
        } catch (err) {
            setError('Failed to create token: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Create New Energy Token</h1>
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>Back</Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Token created successfully! Redirecting to token list...</Alert>}

            <Card>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Token ID</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="id"
                                        value={formData.id}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., token4"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Owner</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="owner"
                                        value={formData.owner}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., user3"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Producer</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="producer"
                                        value={formData.producer}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., solarfarm2"
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Energy Amount (kWh)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        name="energyAmount"
                                        value={formData.energyAmount}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., 5.5"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Price ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., 2.5"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Energy Source</Form.Label>
                                    <Form.Select
                                        name="sourceType"
                                        value={formData.sourceType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select energy source</option>
                                        <option value="solar">Solar</option>
                                        <option value="wind">Wind</option>
                                        <option value="hydro">Hydro</option>
                                        <option value="biomass">Biomass</option>
                                        <option value="geothermal">Geothermal</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Available for Sale"
                                        name="forSale"
                                        checked={formData.forSale}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Green Certified"
                                        name="certifiedGreen"
                                        checked={formData.certifiedGreen}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="d-grid gap-2 mt-4">
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Creating Token...' : 'Create Token'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default CreateToken;