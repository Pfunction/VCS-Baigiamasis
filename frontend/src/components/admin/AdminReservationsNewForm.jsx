import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BaseAxios from '../../hooks/axiosConfig';

const AdminReservationsNewForm = ({ onClose }) => {
  const navigate = useNavigate();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    tool: '',
    userId: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    pickupLocation: '',
    dateRange: {
      from: '',
      to: ''
    },
    quantity: 1
  });
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [isManualEntry, setIsManualEntry] = useState(false);

  useEffect(() => {
    BaseAxios.get('api/users')
      .then((req) => {
        setUsers(req.data)
      })
      .catch((err) => {
        toast.error('Failer to fetch users')
        console.log(err)
      })
  }, []);

  useEffect(() => {
    BaseAxios.get('stores')
      .then((req) => {
        setLocations(req.data.stores)
      })
      .catch((err) => {
        toast.error('Failed to fetch locations');
        console.log(err)
      })
  }, []);

  useEffect(() => {
    BaseAxios.get('tools')
      .then((req) => {
        setTools(req.data.tools)
        setLoading(false)
      })
      .catch((err) => {
        toast.error('Failed to fetch tools');
        setLoading(false);
        console.log(err)
      })
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requestData = {
      productId: formData.tool,
      userId: formData.userId,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      pickupLocation: formData.pickupLocation,
      dateRange: formData.dateRange,
      quantity: formData.quantity
    };

    console.log('Sending reservation data:', requestData);

    BaseAxios.post('reservations', requestData, {method: "POST"})
      .then(() => {
        toast.success('Reservation created succesfully')
        navigate('/admin/reservations')
      })
      .catch((err) => {
        console.log('Error details:', err);
        toast.error(err.essage);
      })
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('dateRange')) {
      const dateField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [dateField]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tool</label>
            <select name="tool" value={formData.tool} onChange={handleChange} className="mt-1 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
              <option value="">Select a tool</option>
              {tools.map((tool) => (
                <option key={tool._id} value={tool._id}>
                  {tool.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">User (Optional)</label>
            <select name="userId" value={formData.userId} onChange={handleChange} className="mt-1 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} - {user.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Name</label>
            <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="mt-1 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="mt-1 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
            <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="mt-1 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
            <select name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} className="mt-1 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
              <option value="">Select a location</option>
              {locations.map((city) => (
                <optgroup key={city._id} label={city.location_city}>
                  {city.stores_data.map((store) => (
                    <option key={store._id} value={store.address}>
                      {store.address}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" name="dateRange.from" value={formData.dateRange.from} onChange={handleChange} className="mt-1 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input type="date" name="dateRange.to" value={formData.dateRange.to} onChange={handleChange} className="mt-1 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" className="mt-1 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
        </div>

        <div className="flex justify-start space-x-3 pt-4">
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Create Reservation
          </button>
          <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminReservationsNewForm;
