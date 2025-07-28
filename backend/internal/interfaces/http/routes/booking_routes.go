package routes

import (
	"agendamento-backend/internal/interfaces/http/handlers"
	"agendamento-backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

// SetupBookingRoutes configura as rotas de agendamentos
func SetupBookingRoutes(router *gin.RouterGroup, bookingHandler *handlers.BookingHandler) {
	bookings := router.Group("/bookings")
	{
		// Rotas para usuários (visualizar e agendar)
		bookings.POST("", bookingHandler.CreateBooking)
		bookings.GET("", bookingHandler.ListBookings)
		bookings.GET("/today", bookingHandler.GetTodayBookings)
		bookings.GET("/upcoming", bookingHandler.GetUpcomingBookings)
		bookings.GET("/user", bookingHandler.GetMyBookings)      // Rota específica primeiro
		bookings.GET("/user-stats", bookingHandler.GetUserStats) // Rota específica primeiro

		// Rotas de estatísticas (antes das rotas com :id)
		bookings.GET("/system-stats", middleware.AdminOnlyMiddleware(), bookingHandler.GetSystemStats)
		bookings.GET("/attendant-stats", middleware.AdminOrAttendantMiddleware(), bookingHandler.GetAttendantStats)
		bookings.GET("/stats", middleware.AdminOrAttendantMiddleware(), bookingHandler.GetBookingStats)

		// Rotas para atendentes e admins (reagendamento) - ANTES das rotas com :id
		rescheduleGroup := bookings.Group("/")
		rescheduleGroup.Use(middleware.AdminOrAttendantMiddleware())
		{
			rescheduleGroup.GET("/reschedule-options/:booking_id", bookingHandler.GetRescheduleOptions)
			rescheduleGroup.PUT("/reschedule-datetime/:booking_id", bookingHandler.RescheduleBookingDateTime)
		}

		// Rotas com parâmetros (depois das rotas específicas)
		bookings.GET("/user/:user_id", bookingHandler.GetUserBookings) // Rota com parâmetro depois
		bookings.GET("/:id", bookingHandler.GetBooking)
		bookings.POST("/:id/cancel", bookingHandler.CancelBooking)
		bookings.PATCH("/:id/cancel", bookingHandler.CancelBooking)

		// Rotas para atendentes e admins (controle de sessões)
		attendantOrAdmin := bookings.Group("/")
		attendantOrAdmin.Use(middleware.AdminOrAttendantMiddleware())
		{
			// Consultas para controle
			attendantOrAdmin.GET("/chair/:chair_id", bookingHandler.GetChairBookings)
			attendantOrAdmin.GET("/date/:date", bookingHandler.GetBookingsByDate)
			attendantOrAdmin.GET("/chair/:chair_id/date/:date", bookingHandler.GetChairBookingsByDate)

			// Operações de controle de sessão
			attendantOrAdmin.POST("/:id/confirm", bookingHandler.ConfirmBooking)
			attendantOrAdmin.POST("/:id/complete", bookingHandler.CompleteBooking)
			attendantOrAdmin.POST("/:id/no-show", bookingHandler.MarkAsNoShow)
			attendantOrAdmin.POST("/:id/attendance", bookingHandler.MarkAttendance)
		}

		// Rotas restritas a admin (operações administrativas)
		adminOnly := bookings.Group("/")
		adminOnly.Use(middleware.AdminOnlyMiddleware())
		{
			adminOnly.PUT("/:id", bookingHandler.UpdateBooking)
			adminOnly.PUT("/:id/reschedule", bookingHandler.RescheduleBooking)
			adminOnly.GET("/date/:date/including-past", bookingHandler.GetBookingsByDateIncludingPast)
		}
	}
}
