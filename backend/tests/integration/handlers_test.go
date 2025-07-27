package integration

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"agendamento-backend/internal/infrastructure/adapters"
	"agendamento-backend/tests/fixtures"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// setupTestRouter configura o router para testes
func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// Adicionar middleware básico
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	return router
}

// TestDTOValidation testa a validação de DTOs
func TestDTOValidation(t *testing.T) {
	validator := adapters.NewValidatorAdapter()
	testData := fixtures.NewTestData()

	// Teste com DTO válido
	validRequest := testData.ValidCreateUserRequest()
	err := validator.ValidateStruct(validRequest)
	assert.NoError(t, err)

	// Teste com DTO inválido
	invalidRequest := testData.InvalidCreateUserRequest()
	err = validator.ValidateStruct(invalidRequest)
	assert.Error(t, err)
}

// TestPasswordHashing testa o hash de senhas
func TestPasswordHashing(t *testing.T) {
	hasher := adapters.NewBcryptPasswordHasher()

	password := "minhasenha123"
	hashedPassword, err := hasher.Hash(password)

	assert.NoError(t, err)
	assert.NotEmpty(t, hashedPassword)
	assert.NotEqual(t, password, hashedPassword)

	// Testar comparação
	err = hasher.Compare(hashedPassword, password)
	assert.NoError(t, err)

	// Testar senha incorreta
	err = hasher.Compare(hashedPassword, "senhaincorreta")
	assert.Error(t, err)
}

// TestTimeService testa o serviço de tempo
func TestTimeService(t *testing.T) {
	timeService := adapters.NewTimeServiceAdapter()

	// Teste Now()
	now := timeService.Now()
	assert.NotZero(t, now)

	// Teste ParseTime()
	layout := "2006-01-02 15:04:05"
	timeStr := "2023-12-25 14:30:00"
	parsedTime, err := timeService.ParseTime(layout, timeStr)
	assert.NoError(t, err)
	assert.Equal(t, 2023, parsedTime.Year())

	// Teste FormatTime()
	formatted := timeService.FormatTime(parsedTime, layout)
	assert.Equal(t, timeStr, formatted)

	// Teste IsBusinessDay()
	assert.True(t, timeService.IsBusinessDay(parsedTime)) // 25/12/2023 é segunda-feira
}

// TestUserEntityMethods testa os métodos da entidade User
func TestUserEntityMethods(t *testing.T) {
	testData := fixtures.NewTestData()

	// Teste usuário admin
	adminUser := testData.AdminUser()
	assert.True(t, adminUser.IsAdmin())
	assert.True(t, adminUser.CanManageUsers())
	assert.True(t, adminUser.CanManageChairs())
	assert.True(t, adminUser.IsActive())

	// Teste usuário comum
	regularUser := testData.ValidUser()
	assert.False(t, regularUser.IsAdmin())
	assert.False(t, regularUser.CanManageUsers())
	assert.False(t, regularUser.CanManageChairs())
	assert.True(t, regularUser.IsActive())

	// Teste usuário pendente
	pendingUser := testData.PendingUser()
	assert.False(t, pendingUser.IsActive())
	assert.False(t, pendingUser.IsApproved())
}

// TestUserDTOs testa a estrutura dos DTOs
func TestUserDTOs(t *testing.T) {
	testData := fixtures.NewTestData()

	// Teste CreateUserRequest
	createRequest := testData.ValidCreateUserRequest()
	assert.NotEmpty(t, createRequest.Name)
	assert.NotEmpty(t, createRequest.CPF)
	assert.NotEmpty(t, createRequest.Email)
	assert.NotEmpty(t, createRequest.Password)
	assert.NotEmpty(t, createRequest.Gender)

	// Teste UpdateUserRequest
	updateRequest := testData.ValidUpdateUserRequest()
	assert.NotEmpty(t, updateRequest.Name)
	assert.NotEmpty(t, updateRequest.CPF)
	assert.NotEmpty(t, updateRequest.Email)
	assert.NotEmpty(t, updateRequest.Gender)

	// Teste LoginRequest
	loginRequest := testData.ValidLoginRequest()
	assert.NotEmpty(t, loginRequest.CPF)
	assert.NotEmpty(t, loginRequest.Password)
}

// TestUserList testa a lista de usuários
func TestUserList(t *testing.T) {
	testData := fixtures.NewTestData()
	userList := testData.UserList()

	assert.Len(t, userList, 4)

	// Verificar tipos de usuários
	assert.True(t, userList[0].IsUser())      // Regular user
	assert.True(t, userList[1].IsAdmin())     // Admin user
	assert.True(t, userList[2].IsAttendant()) // Attendant user
	assert.False(t, userList[3].IsActive())   // Pending user
}

// TestHTTPRequestSimulation simula requisições HTTP básicas
func TestHTTPRequestSimulation(t *testing.T) {
	router := setupTestRouter()

	// Adicionar rota de teste
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Test successful",
			"status":  "ok",
		})
	})

	// Criar requisição
	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()

	// Executar requisição
	router.ServeHTTP(w, req)

	// Verificar resposta
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)

	assert.Equal(t, "Test successful", response["message"])
	assert.Equal(t, "ok", response["status"])
}

// TestJSONMarshaling testa a serialização/deserialização JSON
func TestJSONMarshaling(t *testing.T) {
	testData := fixtures.NewTestData()

	// Teste marshaling
	user := testData.ValidUser()
	jsonData, err := json.Marshal(user)
	assert.NoError(t, err)
	assert.NotEmpty(t, jsonData)

	// Teste unmarshaling
	var unmarshaledUser map[string]interface{}
	err = json.Unmarshal(jsonData, &unmarshaledUser)
	assert.NoError(t, err)

	assert.Equal(t, float64(user.ID), unmarshaledUser["id"])
	assert.Equal(t, user.Name, unmarshaledUser["name"])
	assert.Equal(t, user.Email, unmarshaledUser["email"])
}
