const SignInForm = ({ handleSubmit, handleChange, values, waiting }) => {
    return (
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
          <input
            type="text"
            id="username"
            required
            onChange={handleChange}
            value={values.username || ''}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            id="password"
            required
            onChange={handleChange}
            value={values.password || ''}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={waiting}
            className={`${
              waiting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-700'
            } w-full text-white font-bold py-2 px-4 rounded-md`}
          >
            {waiting ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>
    );
  };
  
  export default SignInForm;
  